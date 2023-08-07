import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { StepsTheme } from "chakra-ui-steps"

export const Fonts = {
  body: "'Rubik', sans-serif",
  heading: "'Kanit', sans-serif"
}

export const Colors = {
  almostWhite: "rgb(245 245 245)",
  primary: "rgb(52 4 68)",
  secondary: "rgb(182 48 75)",
  tertiary: "rgb(11 83 68)",
  tertiary__hovered: "rgb(9 68 55)"
}

export const Constants = {
  borderRadius: "3px"
}

const customizedChakraTheme = extendTheme({
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
    "2xl": "1536px"
  },

  colors: {
    brand: {
      primary: "rgb(52 4 68)",
      tertiary: "rgb(11 83 68)"
    },

    brandSecondary: {
      50: "#ffe8ee",
      100: "#f3c1cb",
      200: "#e699a9",
      300: "#db7186",
      400: "#d04964",
      500: "#b6304b",
      600: "#8e243a",
      700: "#661929",
      800: "#3f0d19",
      900: "#1a0207"
    },

    brandTertiary: {
      50: "#6ae9ce",
      100: "#46e3c1",
      200: "#33caa7",
      300: "#269d82",
      400: "#19715c",
      500: "#0b5344",
      600: "#094437",

      // Same for these three (might be changed later)
      700: "#001811",
      800: "#001811",
      900: "#001811"
    }
  },

  components: {
    Button: {
      baseStyle: {
        borderRadius: Constants.borderRadius,
        _disabled: { opacity: ".5" }
      }
    },

    Card: {
      baseStyle: {
        container: {
          borderRadius: Constants.borderRadius
        }
      }
    },

    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: Constants.borderRadius
          }
        }
      }
    },

    NumberInput: {
      variants: {
        outline: {
          field: {
            borderRadius: Constants.borderRadius
          }
        }
      }
    },

    Stat: {
      baseStyle: {
        container: {
          borderRadius: Constants.borderRadius
        }
      }
    },

    Steps: StepsTheme,

    Textarea: {
      variants: {
        outline: {
          borderRadius: Constants.borderRadius
        }
      }
    }
  },

  fonts: Fonts,
  styles: {
    global: {
      body: {
        bg: "white"
      }
    }
  }
})

export function ChakraUIProvider({ children }) {
  return (
    <ChakraProvider
      toastOptions={{ defaultOptions: { position: "bottom" } }}
      theme={customizedChakraTheme}
    >
      {children}
    </ChakraProvider>
  )
}
