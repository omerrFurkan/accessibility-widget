/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["variant", "&:where(.a11y-widget--dark, .a11y-widget--dark *)"],
  prefix: "a11y-",
  important: true,
  content: ["./src/**/*.{ts,tsx}", "./demo/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--a11y-border))",
        input: "hsl(var(--a11y-input))",
        ring: "hsl(var(--a11y-ring))",
        background: "hsl(var(--a11y-background))",
        foreground: "hsl(var(--a11y-foreground))",
        primary: {
          DEFAULT: "hsl(var(--a11y-primary))",
          foreground: "hsl(var(--a11y-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--a11y-secondary))",
          foreground: "hsl(var(--a11y-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--a11y-destructive))",
          foreground: "hsl(var(--a11y-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--a11y-muted))",
          foreground: "hsl(var(--a11y-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--a11y-accent))",
          foreground: "hsl(var(--a11y-accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--a11y-card))",
          foreground: "hsl(var(--a11y-card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--a11y-radius)",
        md: "calc(var(--a11y-radius) - 2px)",
        sm: "calc(var(--a11y-radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
