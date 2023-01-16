import * as fs from "fs"
import Database from "better-sqlite3"
import logger from "@/lib/log"
import _ from "lodash"

interface DB {
    countPosts(): number
    getPosts(): any
    updatePosts(posts: any): void
}

class SqliteDB implements DB {
    db: Database.Database
    getPostsStatement: Database.Statement
    updatePostsStatement: Database.Statement
    countPostsStatement: Database.Statement

    constructor() {
        // check if db.sqlite exists
        const PATH = "db.sqlite"
        if (!fs.existsSync(PATH)) {
            logger.info("creating_db", { path: PATH })
        }
        this.db = new Database(PATH)

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS migration (
                name TEXT PRIMARY KEY
            )
        `)

        const migrationExistsStatement = this.db.prepare("SELECT name FROM migration WHERE name = ?")

        const migrations = fs.readdirSync("migrations")
        for (const migrationPath of migrations) {
            const migrationName = migrationPath.split(".")[0]

            const ctx = { path: migrationPath, name: migrationName}
            logger.info("migration", ctx) 
            if (migrationExistsStatement.get(migrationName)) {
                logger.info("migration_skip", ctx)
                continue
            }
            logger.info("migration_start", ctx)
            const migrationText = fs.readFileSync(fs.realpathSync(`migrations/${migrationPath}`), 'utf-8')
            const txn = this.db.transaction(() => {
                this.db.exec(migrationText)
            })
            txn()
        }

        this.getPostsStatement = this.db.prepare(`SELECT post_id, title, url, author_id, points, age FROM post ORDER BY rank`)
        // INSERT INTO OR REPLACE does not work ... luckily sqlite supports UPSERT with ON CONFLICT
        this.updatePostsStatement = this.db.prepare(`INSERT INTO post (post_id, author_id, title, body, url, points, age, rank) VALUES ($post_id, $author_id, $title, $body, $url, $points, $age, $rank)
                                                    ON CONFLICT (post_id) DO UPDATE SET author_id = $author_id, title = $title, body = $body, url = $url, points = $points, age = $age, rank = $rank`)
        this.countPostsStatement = this.db.prepare(`SELECT COUNT(*) count FROM post`)
    }

    getPosts() {
        return this.getPostsStatement.all()
    }

    updatePosts(posts) {
        const txn = this.db.transaction((xs) => {
            for (const x of xs) {
                this.updatePostsStatement.run(x)
            }
        })
        txn(posts)
    }

    countPosts(): number {
        return this.countPostsStatement.get().count
    }
}

const impl: DB = new SqliteDB()
export default impl