import db from "@/lib/db"
import Link from "next/link";

export function getServerSideProps() {
    return {
        props: {
            posts: db.getPosts(),
        }
    }
}

export default function Home({ posts }) {
    return (
    <div className="container mx-auto p-4">
      {posts.map((post) => (
        <div key={post.post_id} className="bg-white rounded-lg mb-1">
          <h2 className="text-sm font-medium">
            <a href={post.url} className="text-black">{post.title}</a>
          </h2>
          <p className="text-xs text-gray-600">
            {post.points} points by {post.author_id} {post.age} | <Link className="hover:underline" href={`/post/${post.post_id}`}>3 comments</Link>
          </p>
        </div>
      ))}
    </div>
  );
}