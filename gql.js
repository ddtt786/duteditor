async function gql(query, variables) {
  return (
    await (
      await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": JSON.parse(
            document.getElementById("__NEXT_DATA__").innerText
          ).props.initialProps.csrfToken,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })
    ).json()
  ).data;
}

export { gql };
