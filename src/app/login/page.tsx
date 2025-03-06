"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      const response = await loginUser(email);

      if (!response.authenticated) {
        setError("Email not found.");
        toast({
          title: "Login failed.",
          description: "Please check your email and try again.",
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(response));

      setSuccess("Login successful!");
      toast({
        title: "Login successful.",
        description: "Redirecting please wait.",
      });

      const redirectPath = response.matches?.length > 0 ? "/conversation" : "/";
      setTimeout(() => {
        router.push(redirectPath);
      }, 3000);
    } catch (error: any) {
      setError("Login failed.");
      toast({
        title: "Login failed.",
        description: error.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-10">
      <Card className="w-[350px]">
        <div className="flex justify-center items-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 330 100"
            className="w-full"
          >
            <g
              data-element="wrapper"
              transform="translate(10.80624389648438 -50.87234115600586) scale(.5000000000000096)"
            >
              <g>
                <g
                  data-element="icon"
                  transform="scale(0.15603664632637934) translate(1721.1185035705566 782.8775750957022)"
                >
                  <path
                    id="color_x5F_1_50_"
                    d="M121.533,471.139L41.288,315.715l94.875-87.247l95.075,218.563c3.638-0.397,7.265-0.886,10.88-1.452    l-71.957-165.718l23.72-1.582l75.333,161.427c5.719-1.6,11.388-3.383,16.969-5.413c53.654-19.516,92.128-60.343,124.777-105.98    c1.433-2.003,2.872-3.955,4.319-5.884c-3.304-12.729-7.602-25.191-12.843-37.253c-7.208,5.363-14.794,10.223-22.684,14.498    c-14.206,7.695-30.206,13.736-46.221,11.604c-12.99-1.73-18.982-13.086-30.144-19.953c-8.497-5.228-17.047-10.591-24.01-17.736    c-6.964-7.145-12.292-16.346-12.91-26.304c-0.539-8.682,0.726-15.306-0.963-23.76c-1.053,0.375-2.104,0.77-3.143,1.263    c-4.757,2.256-10.823-1.801-13.943-6.042c4.958,1.948,10.441,2.216,15.635,1.089c-3.71-6.165-13.124-11.885-16.406-17.46    c-6.474-10.998-8.942-22.875-8.648-34.956c-10.869-0.011-21.722-3.985-29.247-11.783c5.983,3.17,13.694,2.77,19.318-0.999    c-10.718-0.992-20.65-8.138-24.996-17.986c9.969,5.254,22.611,1.491,31.491-5.446c8.88-6.938,15.165-16.578,22.623-25.026    c1.851-2.097,3.833-4.146,5.938-6.055c10.506-14.796,23.684-28.07,38.077-37.694c13.404-8.965,16.63-11.507,32.614-13.639    c5.584-0.745,13.198,0.266,21.214,2.351c25.212-6.952,53.671,0.3,74.072,16.937c22.194,18.1,35.206,45.973,38.545,74.416    c3.486,29.701-3.064,60.259-17.19,86.637c6.926,15.893,14.724,31.403,23.378,46.425c4.508-1.789,8.007-2.491,9.069-0.987    c20.516,29.057,32.641,38.936,49.382,68.295c20.467,35.893-1.417,79.577-2.584,120.879c-63.887-16.534-127.132-4.569-236.344,29.739    c-28.053,8.812-58.268,7.218-87.276,2.8c-7.847-1.196-84.352-17.736-83.28-23.864c0.07-0.402,0.14-0.804,0.211-1.207    L121.533,471.139z M410.406,476.267c-50.515,8.267-88.03,28.203-155.32,34.61c-70.025,6.667-154.065-15.808-150.646-44.011    c-29.058,30.767,56.407,62.39,135.035,62.39c48.438,0,101.348-8.009,149.565-12.82c48.217-4.811,92.029-2.157,129.1,30.325    c9.768-16.865,21.883-32.252,35.848-45.53C510.775,472.749,460.92,468,410.406,476.267z"
                    fill="#457645"
                  ></path>
                </g>
                <text
                  transform="translate(100.80624389648438 276.87234115600586)"
                  fill="#457645"
                  fontFamily="JP Zen Antique"
                  fontSize="64"
                  data-element="company-name"
                  dx="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
                >
                  Iconad Learning
                </text>
              </g>
            </g>
          </svg>
        </div>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {success && (
              <p className="text-sm text-green-500 mt-2">{success}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </CardFooter>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500 mt-2 text-center">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-500 hover:underline">
                Register Here
              </a>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
