import React from "react"
import Async from "react-async"
import { StyleSheet, Text, View, Image } from "react-native"

const loadUser = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(json => json.data)

export default function App() {
  return (
    <View style={styles.container}>
      <Async promiseFn={loadUser} context={{ userId: 1}}>
        <Async.Pending>
          <Text>Loading...</Text>
        </Async.Pending>
        <Async.Fulfilled>
          {user => (
            <>
              <Image
                style={{ width: 100, height: 100, marginBottom: 10 }}
                source={{ uri: user.avatar }}
              />
              <Text style={{ fontSize: 16 }}>
                {user.first_name} {user.last_name}
              </Text>
            </>
          )}
        </Async.Fulfilled>
        <Async.Rejected>{res => <Text>{res.status}</Text>}</Async.Rejected>
      </Async>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
