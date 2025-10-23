import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { MessageSquare,User,Mail,Lock,EyeOff,Eye,Loader2, Phone, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const {signUp,isSigningUp, sendOtp} = useAuthStore();
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const validateForm = () => {
    if(!formData.fullName.trim()){
      return toast.error("Full Name is required");
    }
    if(!formData.email.trim()){
      return toast.error("Email is required");
    }
    if(!formData.phone.trim()){
      return toast.error("Phone is required");
    }
    if(!/\S+@\S+\.\S+/.test(formData.email)){
      return toast.error("Email is invalid");
    }
    if(!formData.password.trim()){
      return toast.error("Password is required");
    }
    if(formData.password.length < 6){
      return toast.error("Password must be at least 6 characters");
    }
    return true;
  };
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if(isValid!==true) return;
    try {
      setIsSendingOtp(true);
      await sendOtp(formData.phone);
      setIsOtpStep(true);
      setOtpCode("");
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if(!otpCode.trim()){
      return toast.error("Enter the OTP code");
    }
    await signUp({...formData, code: otpCode});
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get Started with your free account</p>
            </div>
          </div>
          <form onSubmit={isOtpStep ? handleVerify : handleRequestOtp} className="space-y-6">

            {!isOtpStep && (
            <>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10 pointer-events-none">
                  <User className="size-5 text-base-content/50" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 relative`}
                  placeholder="Kichu"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10 pointer-events-none">
                  <Phone className="size-5 text-base-content/50" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="0123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0,10) })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10 pointer-events-none">
                  <Mail className="size-5 text-base-content/50" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10 pointer-events-none">
                  <Lock className="size-5 text-base-content/50" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/50" />
                  ) : (
                    <Eye className="size-5 text-base-content/50" />
                  )}
                </button>
              </div>
            </div>
            </>
            )}

            {isOtpStep && (
              <>
                <div className="alert bg-base-200 text-base-content/70">
                  OTP sent to <span className="font-medium ml-1">{formData.phone}</span>. Enter the code to verify.
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">OTP Code</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10 pointer-events-none">
                      <Shield className="size-5 text-base-content/50" />
                    </div>
                    <input
                      type="text"
                      className={`input input-bordered w-full pl-10`}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              {!isOtpStep ? (
                <button type="submit" className="btn btn-primary w-full" disabled={isSendingOtp}>
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              ) : (
                <>
                  <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp} >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn w-full"
                    onClick={() => setIsOtpStep(false)}
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern 
        title="Join our community"
        subtitle="Connect with friends and the world around you."
      />
    </div>
  )
}

export default SignUpPage