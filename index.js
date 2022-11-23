import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient.js";

import fs from "fs";

const params = {
  ProjectionExpression: "id, parentChapterId",

  TableName: "Chapter-TABLE_NAME",
};

export const run = async () => {
  let chapterIds = [];
  let parentchapterIds = [];
  let orphan = [];
  let grandchild = [];
  let greatgrandchild = [];

  try {
    // Fetch all data related (id and parentChapterId)
    const data = await ddbClient.send(new ScanCommand(params));

    // count all chapter fetched
    console.log(data.Count);

    data.Items.forEach((item) => {
      chapterIds.push(item.id.S);
      parentchapterIds.push(item);
    });

    const rootElementRemoved = data.Items.filter(
      (item) => item.parentChapterId.S !== "none"
    );

    // This will find chapter direct under root chapter (son)  (Result => 36 orphan chapters)

    rootElementRemoved.forEach((item) => {
      if (!chapterIds.includes(item.parentChapterId.S)) {
        orphan.push(item.id.S);
      }
    });

    //  run this func one more time if we get some orphan chapters

    // 1st approach , but here func will run 2 or 3 times

    /* if (orphan.length !== 0) {
      run();
    } else {
      return console.log("All orphan Chapters deleted");
    } */

    // 2nd approach

    // In this approach we can get all orphan chapters in one go.

    // This will find chapter  grandSon chapters (Result => 117 orphan chapters)

    parentchapterIds.forEach((item) => {
      if (orphan.find((i) => i === item.parentChapterId.S)) {
        grandchild.push(item.id.S);
      }
    });

    //  This will find   greatgrandSon chapters here we got 33 results

    parentchapterIds.forEach((item) => {
      if (grandchild.find((i) => i === item.parentChapterId.S)) {
        greatgrandchild.push(item.id.S);
      }
    });

    console.log("orphan--- " + orphan.length);
    console.log("orphan2--- " + grandchild.length);
    console.log("orphan-3-- " + greatgrandchild.length);
  } catch (err) {
    console.error(err);
  }
};
run();
