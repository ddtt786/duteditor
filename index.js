import io from "socket.io-client";
import { cloudServerInfo, SELECT_PROJECT } from "./query";
import { gql } from "./gql";

const id = location.pathname.split("/").filter(Boolean)[1];

const {
  cloudServerInfo: { query },
} = await gql(cloudServerInfo, { id });

const socket = io(`wss://playentry.org`, {
  path: "/cv",
  query: {
    q: query,
    type: undefined,
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("connected");
});

socket.on("connect_error", (error) => {
  console.log(error);
});

const vdata = [];

socket.once("welcome", async (data) => {
  const {
    project: { variables },
  } = await gql(SELECT_PROJECT, { id });

  vdata.push(...data.variables);

  const vars = [...variables.filter(({ isRealTime }) => isRealTime)].map(
    ({ id: id_, name }) => {
      const { variableType } = vdata.find(({ id }) => id === id_);
      return { name, variableType, id: id_ };
    }
  );

  console.table(vars);
});

class Variable {
  id = null;

  constructor(id) {
    this.id = id;
  }

  set(value) {
    socket.emit("action", {
      id: this.id,
      variableType: "variable",
      type: "set",
      value,
    });
  }
}

class List {
  id = null;
  data = null;

  constructor(id) {
    this.id = id;
    this.data = vdata.find(({ id }) => id === this.id);
    console.log(this.data);
  }

  push(data) {
    socket.emit(
      "action",
      {
        id: this.id,
        variableType: "list",
        type: "append",
        data,
      },
      (_, { key }) => {
        this.data.list.push(key);
      }
    );
  }

  remove(index) {
    socket.emit(
      "action",
      {
        id: this.id,
        variableType: "list",
        type: "delete",
        index,
      },
      () => {
        this.data.list.splice(index, 1);
      }
    );
  }

  insert(index, data) {
    socket.emit(
      "action",
      {
        id: this.id,
        variableType: "list",
        type: "insert",
        index,
        data,
      },
      (_, { key }) => {
        this.data.list.splice(index, 0, key);
      }
    );
  }

  set(index, data) {
    socket.emit(
      "action",
      {
        id: this.id,
        variableType: "list",
        type: "replace",
        key: this.data.list[index],
        index,
        data,
      },
      (_, { newKey }) => {
        this.data.list[index] = newKey;
      }
    );
  }
}

globalThis.variable = Variable;
globalThis.list = List;

export {};
