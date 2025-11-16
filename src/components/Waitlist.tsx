import { useState } from "react";
import { Loader } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Waitlist() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: submitError } = await supabase
        .from("waitlist_submissions")
        .insert([
          {
            name: formData.name,
            email: formData.email,
          },
        ]);

      if (submitError) throw submitError;

      setIsSubmitted(true);
      setFormData({ name: "", email: "" });

      setTimeout(() => setIsSubmitted(false), 2500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full bg-[#F3F7FA] py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-center">
        {/* SUCCESS STATE */}
        {isSubmitted ? (
          <div className="py-10">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className="text-2xl font-bold text-[#072741]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              You're on the List!
            </h3>
            <p
              className="text-[#6B7A85] mt-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              We'll notify you when we launch.
            </p>
          </div>
        ) : (
          <>
            {/* MAIN CONTENT */}
            <h2
              className="text-3xl font-bold text-[#072741] mb-3"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Arkenix is Evolving...
            </h2>

            <p
              className="text-[#6B7A85] mb-8 text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              We're building something powerful for marketers, founders, and
              teams. Join our exclusive waitlist for early access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#348ADC] outline-none"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#348ADC] outline-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#348ADC] hover:bg-[#2A6FB0] text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader size={20} className="animate-spin" />}
                {isLoading ? "Joining..." : "Join the Waitlist →"}
              </button>
            </form>

            <p className="text-[#9AA4AD] text-sm mt-4">
              No spam. Only important updates.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
