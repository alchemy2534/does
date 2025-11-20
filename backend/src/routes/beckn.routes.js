const express = require('express');
const router = express.Router();
const axios = require('axios');
const { signBecknRequest } = require('../controllers/beckn.controller');
const { mapCompetencies } = require('../utils/competencyMapper');
const Verification = require('../models/verification.model');

router.post('/search', async (req, res) => {
  console.log('Search hit:', req.body.skill, 'Request #1');
  const searchIntent = {
    context: {
      domain: 'onest:skills',
      action: 'search',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      country: 'IND',
      city: 'std:080',
      transaction_id: Date.now().toString(),
      message_id: Date.now().toString(),
      timestamp: new Date().toISOString()
    },
    message: { intent: { item: { descriptor: { name: req.body.skill } } } }
  };
  const signature = signBecknRequest(searchIntent);
  try {
    const lookupResponse = await axios.post(`${process.env.BECKN_REGISTRY_URL}/onest/lookup`, {
      country: "IND",
      type: "bpp",
      domain: "onest:skills"
    }, { headers: { Authorization: `Signature ${signature}` } });
    console.log('Full lookup response:', JSON.stringify(lookupResponse.data, null, 2));
    const bppUrl = lookupResponse.data.subscribers?.[0]?.subscriber_url;

    if (!bppUrl) {
      const mockData = [{ skill: req.body.skill, nsqf_level: 5 }];
      const mappedData = mapCompetencies(mockData, 5);
      return res.status(200).json({
        ack: true,
        message: `Search for ${req.body.skill} (No BPP found, mock data)`,
        signature,
        mock_data: { skill: req.body.skill, nsqf_level: 5 },
        mapped_data: mappedData,
        bppUrl: null
      });
    }

    const bppResponse = await axios.post(`${bppUrl}/search`, searchIntent, {
      headers: { Authorization: `Signature ${signature}`, 'Content-Type': 'application/json' }
    });
    res.json({
      ...bppResponse.data,
      bppUrl: bppUrl
    });
  } catch (error) {
    console.error('ONEST error:', error.response?.data || error.message);
    const mockData = [{ skill: req.body.skill, nsqf_level: 5 }];
    const mappedData = mapCompetencies(mockData, 5);
    res.status(200).json({
      ack: true,
      message: `Search for ${req.body.skill} (ONEST unavailable, mock data)`,
      signature,
      mock_data: { skill: req.body.skill, nsqf_level: 5 },
      mapped_data: mappedData,
      bppUrl: null
    });
  }
});

router.post('/on_search', async (req, res) => {
  console.log('Received callback:', req.body, 'Request #1');
  const Verification = require('../models/verification.model');
  if (req.body.context && req.body.message.catalog) {
    await new Verification({
      order_id: req.body.context.transaction_id,
      student_id: 'student-temp',
      status: 'searched',
      verified_data: req.body.message.catalog
    }).save();
  }
  res.status(200).json({ ack: true });
});

router.post('/select', async (req, res) => {
  console.log('Select hit:', req.body, 'Request #1');
  const { item_id, provider_id, skill_category, bppUrl } = req.body;
  const selectIntent = {
    context: {
      domain: 'onest:skills',
      action: 'select',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      transaction_id: Date.now().toString()
    },
    message: { order: { items: [{ id: item_id, provider_id }], intent: { item: { descriptor: { name: skill_category } } } } }
  };
  const signature = signBecknRequest(selectIntent);
  try {
    if (!bppUrl) {
      console.log('No bppUrl provided, using fallback');
      await new Verification({
        order_id: `order-${Date.now()}`,
        student_id: 'student-temp',
        status: 'selected'
      }).save();
      return res.status(200).json({ ack: true, order_id: `order-${Date.now()}`, signature });
    }

    const bppResponse = await axios.post(`${bppUrl}/select`, selectIntent, {
      headers: { Authorization: `Signature ${signature}`, 'Content-Type': 'application/json' }
    });
    await new Verification({
      order_id: `order-${Date.now()}`,
      student_id: 'student-temp',
      status: 'selected'
    }).save();
    res.json({ ack: true, order_id: `order-${Date.now()}`, signature });
  } catch (error) {
    console.error('ONEST select error:', error.response?.data || error.message);
    await new Verification({
      order_id: `order-${Date.now()}`,
      student_id: 'student-temp',
      status: 'selected'
    }).save();
    res.status(200).json({ ack: true, order_id: `order-${Date.now()}`, signature });
  }
});

router.post('/init', async (req, res) => {
  console.log('Init hit:', req.body, 'Request #1');
  const { order_id, student_id, competencies, bppUrl } = req.body;
  const initIntent = {
    context: {
      domain: 'onest:skills',
      action: 'init',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      transaction_id: order_id
    },
    message: { order: { id: order_id, items: competencies.map(c => ({ descriptor: { name: c.name } })) } }
  };
  const signature = signBecknRequest(initIntent);
  try {
    if (!bppUrl) {
      console.log('No bppUrl provided, using fallback');
      await Verification.updateOne({ order_id }, { status: 'initiated' });
      return res.status(200).json({ ack: true, signature });
    }

    await axios.post(`${bppUrl}/init`, initIntent, {
      headers: { Authorization: `Signature ${signature}`, 'Content-Type': 'application/json' }
    });
    await Verification.updateOne({ order_id }, { status: 'initiated' });
    res.json({ ack: true, signature });
  } catch (error) {
    console.error('ONEST init error:', error.response?.data || error.message);
    await new Verification({ order_id, student_id, status: 'initiated' }).save();
    res.status(200).json({ ack: true, signature });
  }
});

router.post('/confirm', async (req, res) => {
  console.log('Confirm hit:', req.body, 'Request #1');
  const { order_id, student_id, bppUrl } = req.body;
  const confirmIntent = {
    context: {
      domain: 'onest:skills',
      action: 'confirm',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      transaction_id: order_id
    },
    message: { order: { id: order_id } }
  };
  const signature = signBecknRequest(confirmIntent);
  try {
    if (!bppUrl) {
      console.log('No bppUrl provided, using fallback');
      await Verification.updateOne({ order_id }, { status: 'confirmed' });
      return res.status(200).json({ ack: true, signature });
    }

    await axios.post(`${bppUrl}/confirm`, confirmIntent, {
      headers: { Authorization: `Signature ${signature}`, 'Content-Type': 'application/json' }
    });
    await Verification.updateOne({ order_id }, { status: 'confirmed' });
    res.json({ ack: true, signature });
  } catch (error) {
    console.error('ONEST confirm error:', error.response?.data || error.message);
    await Verification.updateOne({ order_id }, { status: 'confirmed' });
    res.status(200).json({ ack: true, signature });
  }
});

router.post('/on_confirm', (req, res) => {
  console.log('Received confirm callback:', req.body, 'Request #1');
  const Verification = require('../models/verification.model');
  Verification.updateOne({ order_id: req.body.context.transaction_id }, { status: 'confirmed' });
  res.status(200).json({ ack: true });
});

router.post('/fulfill', async (req, res) => {
  console.log('Fulfill hit:', req.body, 'Request #1');
  const { order_id, bppUrl } = req.body;
  const fulfillIntent = {
    context: {
      domain: 'onest:skills',
      action: 'fulfill',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      transaction_id: order_id
    },
    message: { order: { id: order_id } }
  };
  const signature = signBecknRequest(fulfillIntent);
  try {
    if (!bppUrl) {
      console.log('No bppUrl provided, using fallback');
      await Verification.updateOne({ order_id }, { status: 'fulfilled' });
      return res.status(200).json({ ack: true, signature });
    }

    const bppResponse = await axios.post(`${bppUrl}/fulfill`, fulfillIntent, {
      headers: { Authorization: `Signature ${signature}`, 'Content-Type': 'application/json' }
    });
    await Verification.updateOne({ order_id }, { status: 'fulfilled', verified_data: bppResponse.data });
    res.json({ ack: true, signature });
  } catch (error) {
    console.error('ONEST fulfill error:', error.response?.data || error.message);
    await Verification.updateOne({ order_id }, { status: 'fulfilled' });
    res.status(200).json({ ack: true, signature });
  }
});

router.post('/on_fulfill', (req, res) => {
  console.log('Received fulfill callback:', req.body, 'Request #1');
  const Verification = require('../models/verification.model');
  Verification.updateOne({ order_id: req.body.context.transaction_id }, { verified_data: req.body.message.order, status: 'fulfilled' });
  res.status(200).json({ ack: true });
});

router.post('/status', async (req, res) => {
  console.log('Status hit:', req.body, 'Request #1');
  const { order_id } = req.body;
  const statusIntent = {
    context: {
      domain: 'onest:skills',
      action: 'status',
      bap_id: process.env.BECKN_SUBSCRIBER_ID,
      bap_uri: `http://localhost:${process.env.PORT}/api/beckn`,
      transaction_id: order_id
    },
    message: { order_id }
  };
  const signature = signBecknRequest(statusIntent);
  try {
    const verification = await Verification.findOne({ order_id });
    res.json({ ack: true, status: verification.status, signature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;