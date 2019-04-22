import { configure } from "@storybook/react"

const req = require.context("../stories", true, /\.stories\.js$/)
configure(() => req.keys().forEach(filename => req(filename)), module)
