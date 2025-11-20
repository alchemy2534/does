exports.mapCompetencies = (skillsData, targetLevel) => {
  return skillsData.map(skill => ({
    name: skill.skill || skill.name,
    nsqf_level: skill.nsqf_level || 1,
    competency_level: skill.nsqf_level > 6 ? 'advanced' : skill.nsqf_level > 3 ? 'intermediate' : 'basic',
    verified: true
  })).filter(skill => !targetLevel || skill.nsqf_level === targetLevel);
};