import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient.js";

const params = {
  ProjectionExpression: "id, parentChapterId",

  TableName: "TABLE_NAME",
};

export const run = async () => {
  let chapterIds = [];
  let parentchapterIds = [];
  let orphan = [];

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

    rootElementRemoved.forEach((item) => {
      if (!chapterIds.includes(item.parentChapterId.S)) {
        orphan.push(item.id.S);
      }
    });

    // run this func one more time if we get some orphan chapters

    if (orphan.length !== 0) {
      run();
    } else {
      return console.log("All orphan Chapters deleted");
    }

    // We can get all childrens but here we need to run this some more times

    // parentchapterIds.forEach((item) => {
    //   if (orphan.some((i) => i === item.parentChapterId.S)) {
    //     orphan.push(item.id.S);

    //     console.log(item);
    //   }
    // });

    console.log("orphan--- " + orphan.length);
  } catch (err) {
    console.error(err);
  }
};
run();
