import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import useSignIn from "@/hooks/useSignIn";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const signIn = useSignIn();

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await signIn.mutateAsync({ email, password });
      navigate("/");
    } catch (err) {
      // error handled in hook via toast
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-xl max-w-md px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Sign In</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and password to sign in!</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>{" "}
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@gmail.com"
                error={!!errors.email}
                hint={errors.email}
              />
            </div>
            <div>
              <Label>
                Password <span className="text-error-500">*</span>{" "}
              </Label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  error={!!errors.password}
                  hint={errors.password}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" size="sm" disabled={signIn.status === 'pending'}>
                {signIn.status === 'pending' ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
