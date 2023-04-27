import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { StepsTheme } from "chakra-ui-steps"

export const Fonts = {
  body: "'Rubik', sans-serif",
  heading: "'Kanit', sans-serif"
}

const additionalThemeConfig = {
  colors: {
    brand: {
      primary: "rgb(52 4 68)",
      tertiary: "rgb(9 68 55)"
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
}

const chakraUIStepsThemeConfig = {
  components: {
    Steps: StepsTheme
  }
}

export function ChakraUIProvider({ children, useSteps = false }) {
  return (
    <ChakraProvider
      theme={extendTheme(
        useSteps
          ? { ...additionalThemeConfig, ...chakraUIStepsThemeConfig }
          : additionalThemeConfig
      )}
    >
      {children}
    </ChakraProvider>
  )
}
