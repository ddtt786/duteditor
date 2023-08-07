const cloudServerInfo = `query ($id: ID!) {
  cloudServerInfo(id: $id) {
    url
    query
  }
}`;

const SELECT_PROJECT = `query SELECT_PROJECT($id: ID!, $groupId: ID) {
  project(id: $id, groupId: $groupId) {
    variables
  }
}`;
export { cloudServerInfo, SELECT_PROJECT };
