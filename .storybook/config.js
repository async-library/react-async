import { configure } from "@storybook/react"

import "storybook-chromatic"

const req = require.context("../stories", true, /\.stories\.js$/)
configure(() => req.keys().forEach(filename => req(filename)), module)
