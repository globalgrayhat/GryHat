/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD

// Importing the Material Tailwind plugin wrapper
import withMT from "@material-tailwind/react/utils/withMT";

// Exporting Tailwind configuration using Material Tailwind integration
export default withMT({
  // Specify which files Tailwind should scan for class names
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],

  theme: {
    // Set default font family
=======
import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    fontFamily: {
      sans: ["Open Sans", "sans-serif"],
    },
    extend: {
<<<<<<< HEAD
      // Extend scrollbar styles using the plugin
      scrollbar: ["rounded"],

      // Custom padding value
      padding: {
        'custom': '.5px', // Very small custom padding
      },

      // Extend the default Tailwind color palette
      colors: {
        customBlue: '#0C1326',           // Dark blue background color
        customFontColorBlack: '#2A3B4F', // Dark gray/black font color
        customBlueShade: '#F3F7FE',      // Light blue shade for backgrounds
        hoverBlue: '#D4E4FC',            // Blue hover effect color
        customTextColor: '#2A3B4F',      // Custom text color
        skyBlueCustom: "#F3F7FE",        // Duplicate of customBlueShade

        // ✅ Custom "brand" color palette used in @apply (bg-brand-600, etc.)
        brand: {
          100: "#e0f2fe", // Light brand blue
          600: "#0284c7", // Main brand blue
          700: "#0369a1", // Darker brand blue for hover states
        },
      },
    },
  },

  // Plugins used in the project
  plugins: [
    require("tailwind-scrollbar"), // Adds scrollbar styling utilities
  ],
});
=======
      scrollbar: ["rounded"],
      padding: {
        'custom': '.5px', // Replace '20px' with your desired padding value
      },
      colors: {   
        customBlue: '#0C1326',
        customFontColorBlack:'#2A3B4F',
        customBlueShade:'#F3F7FE',
        hoverBlue:'#D4E4FC',
        customTextColor:'#2A3B4F',
        skyBlueCustom:"#F3F7FE"
      } 
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
  ],
});
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
