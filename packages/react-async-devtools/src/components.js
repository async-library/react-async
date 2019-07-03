/* eslint-disable react/prop-types */
import React from "react"

export const Root = props => (
  <div
    {...props}
    style={{
      position: "absolute",
      top: "1em",
      right: "1em",
      width: "15em",
      boxSizing: "border-box",
      border: "1px solid #0366d6",
      borderRadius: "1em",
      boxShadow: "0 2px 1em #00000022",
      background: "white",
      padding: "1em",
      fontSize: "1rem",
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif`,
      ...props.style,
    }}
  />
)

export const Range = props => (
  <input
    type="range"
    role="slider"
    {...props}
    style={{
      fontSize: "inherit",
      display: "block",
      width: "100%",
      margin: "1em 0",
    }}
  />
)

export const Checkbox = props => (
  <input
    type="checkbox"
    {...props}
    style={{
      fontSize: "inherit",
      marginRight: "0.5em",
      verticalAlign: "bottom",
      ...props.style,
    }}
  />
)

export const Label = props => (
  <label
    {...props}
    style={{
      display: "block",
      marginBottom: "1.5em",
      ...props.style,
    }}
  />
)

export const Small = props => (
  <small
    {...props}
    style={{
      display: "block",
      marginTop: "0.5em",
      textTransform: "uppercase",
      opacity: "0.5",
      ...props.style,
    }}
  />
)

export const Ol = props => (
  <ol
    {...props}
    style={{
      margin: "0",
      padding: "0",
      listStyle: "none",
      lineHeight: "2em",
      ...props.style,
    }}
  />
)

export const Li = props => (
  <li
    {...props}
    style={{
      display: "flex",
      justifyContent: "space-between",
      ...props.style,
    }}
  />
)

export const Button = props => (
  <button
    {...props}
    style={{
      height: "1.6rem",
      padding: "2px 6px",
      border: "0",
      borderRadius: "0.5em",
      background: "#0366d6",
      color: "#fff",
      ...props.style,
    }}
  />
)
