import { invalidMethod, isAdmin, unauthorized } from '@/lib/admin'
import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from "node-html-parser";
import _ from "lodash"

import logger from "@/lib/log"
import db from "@/lib/db"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO(refactor): Could use middleware to make this cleaner
  if (!isAdmin(req)) return unauthorized(res);
  if (req.method !== 'POST') return invalidMethod(res);

  const oldPostsCount = db.countPosts()
  const posts = await getNewPosts()
  db.updatePosts(posts)
  const newPostsCount = db.countPosts()

  logger.info("ingest", { old: oldPostsCount, new: newPostsCount, scraped: posts.length })
  return res.status(200).end()
}

function safeParseInt(value) {
  const parsed = parseInt(value)
  if (isNaN(parsed)) {
    throw new Error(`value: ${value} is not a number`)
  }
  return parsed
}

function parsePost([post, metadata]) {
  const links = post.querySelectorAll("a");

  const storyLink = links[1];
  const link = storyLink.getAttribute("href");
  const title = storyLink.text;

  const rankText = post.querySelector("span.rank").text;
  const rank = safeParseInt(rankText.replace(".", ""));

  const center = post.querySelector("center");
  if (!center) {
    logger.info("center_missing", { title, rank });
    return null;
  }

  const upvoteLink = center.querySelector("a");
  const post_id = safeParseInt(upvoteLink.getAttribute("id").replace("up_", ""));
  const author = metadata.querySelector("a.hnuser");

  const points = metadata.querySelector("span.score").text;
  const pointsInt = safeParseInt(points.split(" ")[0])
  const age = metadata.querySelector("span.age");

  return {
    post_id,
    author_id: author.text,
    title,
    body: "",
    url: link,
    points: pointsInt,
    age: age.text,
    rank,
  };
}

async function getNewPosts() {
  const response = await fetch("https://news.ycombinator.com/");
  const text = await response.text();
  const ast = parse(text);
  const posts = ast.querySelectorAll("tr.athing");
  const metadatas = ast.querySelectorAll("td.subtext");

  const parsedPosts = _.zip(posts, metadatas)
    .map(parsePost)
    .filter((p) => p !== null);
  return parsedPosts
}