import Post from '../post'
import { AttachmentType, AttachmentDisplay } from '../attachment'
import Thread from '../thread'

let TEST_POSTS: Post[] = (function() {
    var post1 = new Post('eos')
    post1.id = 123
    post1.transaction = 'post19d5762a814d67622ab436f68ef7684a402c5324f533aaf8ae34bcd5586e'
    post1.blockApprox = 1000
    post1.parentUuid = ''
    post1.threadUuid = '5be1adec-1310-4b04-a7ee-7fbe16d6ed67'
    post1.uuid = '5be1adec-1310-4b04-a7ee-7fbe16d6ed67'
    post1.title = 'First time here? Read this guide to learn how to use Discussions.app & earn tips'
    post1.poster = 'asphyxiating'
    post1.content = `Welcome to Discussions.app, the EOS DApp powered by Novusphere. This is a guide to help you get started using this website.

Discussions.app is a blockchain based social network. It has some similarity to reddit. You can post threads and blog posts here. You make money if people like your content and tip you.

There are two ways to post content here. One is by using an ID and the other is by using an EOS account. To post content using your ID, you need to set this up in the settings page. After visiting the site, click Set ID from the top left corner of the site to set your ID.

After clicking on Set ID, you will visit the settings page where you can set your ID name. Set a name you want (it must be less than 13 characters) and then click save. In the key field, you will see a large key that starts with 5. This is like your password. It will be used to claim the money you earn in this site. Make sure to save it.

After clicking save, a text file will be downloaded to your computer which includes this password key and your ID name. I have shown this process in a screenshot below. I set my ID name as “exampleidname”.`
    post1.createdAt = new Date(1559864468276)
    post1.sub = 'eos'
    post1.tags = ['wasa']
    post1.mentions = ['asphyxiating']
    post1.totalReplies = 2
    post1.score = 1.1
    post1.votes = 10
    post1.alreadyVoted = true

    // regular post, attachment (youtube url)
    var post2 = new Post('eos')
    post2.id = 124
    post2.transaction = 'post29d5762a814d67622ab436f68ef7684a402c5324f533aaf8ae34bcd5586e'
    post2.blockApprox = 1000
    post2.parentUuid = ''
    post2.threadUuid = '4be1adec-1310-4b04-a7ee-7fbe16d6ed67'
    post2.uuid = '4be1adec-1310-4b04-a7ee-7fbe16d6ed67'
    post2.title = 'Hello world 2!'
    post2.poster = 'boooooootl3r'
    post2.content = 'Hey, **wasa** #wasa wasssupppp!! Attachment!'
    post2.createdAt = new Date(1559864468276)
    post2.sub = 'eos'
    post2.tags = ['wasa']
    post2.totalReplies = 0
    post2.score = 1.09
    post2.votes = 1
    post2.attachment.display = AttachmentDisplay.Link
    post2.attachment.type = AttachmentType.Url
    post2.attachment.value =
        'https://www.reddit.com/r/eos/comments/bzmk9k/will_voice_tokens_be_airdropped/'

    return [post1, post2]
})()

export default class DummyService {
    constructor() {}

    async getThread(_chain: string, id: number): Promise<Thread | Error> {
        if (id == TEST_POSTS[1].id) {
            const posts = [TEST_POSTS[1]]
            const thread = new Thread()

            thread.makePost(posts)
            await thread.normalize()
            return thread
        }

        throw new Error('No thread found')
    }

    async getPostsForSubs(_subs: string[]): Promise<Post[]> {
        return TEST_POSTS
    }

    async getPostsForTags(_tags: string[]): Promise<Post[]> {
        return TEST_POSTS
    }
}
