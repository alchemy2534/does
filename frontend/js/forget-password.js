function showStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById(step).classList.add("active");
}

// STEP 1: SEND OTP
function sendOTP() {
    const email = document.getElementById("email").value;
    if (!email) return alert("Enter your email!");

    alert("OTP sent to " + email);
    showStep("step2");
}

// STEP 2: VERIFY OTP
function verifyOTP() {
    const otp = document.getElementById("otp").value;

    if (otp.length !== 6) return alert("Enter valid 6-digit OTP");

    alert("OTP Verified!");
    showStep("step3");
}

// STEP 3: RESET PASSWORD
function resetPassword() {
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (!newPass || !confirmPass) return alert("Fill all fields");

    if (newPass !== confirmPass) return alert("Passwords do not match!");

    alert("Password Reset Successfully!");
}
