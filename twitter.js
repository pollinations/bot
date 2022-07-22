import { TwitterApi } from 'twitter-api-v2';
//import SocialPost from "social-post-api";
import runModel from "@pollinations/ipfs/awsPollenRunner.js";


// Instantiate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAFsNaAEAAAAALWUrbzIccb6jCIDw1wMP7ZffCAs%3DnZ7XNT9c26caDXhUMyiUZEWvpQTITxGeoMeCLp2ZmgQEjynUlT');

// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly;

const twitter = roClient.v2;

// Play with the built in methods
const { data: user } = await twitter.userByUsername('pollinations_ai', {"user.fields":"description"});

const userId = user.id;
// get followers


//await twitterClient.v1.tweet('Hello, this is a test from a bot who is still waking up.');


const userName = `@${user.username}`;

// get the time 1 hour ago
const aDayAgo = new Date().getTime() - (1000 * 60 * 60 * 1);

async function processMentions(lastTime=aDayAgo) {
    console.log("loading mentions from", lastTime)
    const timeBeforeStarting = new Date().getTime();
    // get mentions of our user (pollinations_ai)
    const mentionsData = (await twitter.userMentionTimeline(
        userId,
        {
            "expansions": "author_id","tweet.fields":"created_at",
            "start_time": new Date(lastTime).toISOString(),
        })
        ).data;

    const mentions = mentionsData.data;

    // filter all mentions that start with the word create
    if (mentions) { 
        const createMentions = mentions.filter(mention => mention.text.toLowerCase().trim().includes("create"));

        console.log("mentions", createMentions)

        for (const mention of createMentions) {
            const res = await createImageForMention(mention);
            console.log("created image",res)
        }
    }
    else {
        console.error("mentions are empty", mentionsData);
    }
   // console.log("created images", images)

    setTimeout(() => processMentions(timeBeforeStarting), 1000 * 60)
}


async function createImageForMention({author_id, text}) {

    // get user name of the user who sent the tweet from the author_id
    const mentionName = "@" + (await twitter.user(author_id, {"user.fields":"username"})).data.username;

    console.log("creating image for ", mentionName);

    // remove username and create word from text
    const formattedText = text.replace(userName, "").replace("create","").replaceAll("\"","").trim();

    const inputs = {
        Prompt: formattedText,
        social_mention: mentionName,
        social: true,
        social_platforms: "twitter"
    };

    console.log("inputs", inputs)
    const outputs = await runModel(inputs, 
        "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage"
    );
    return outputs[".cid"]
}


//const followers = await twitter.followers(userId)
//const follower = await Promise.all(followers.data.map(async ({id}) => (await (await twitter.user(id, {"user.fields":"description"})).data.description)))

async function createBioPortrait(userId) {
    const user = await twitter.user(userId, {"user.fields":"description"});
    await createImageForMention({author_id: userId, text: `Portrait of ${caroline.description} trending on Artstation`})
}

const { data: caroline } = await twitter.userByUsername('eni_lorac', {"user.fields":"description"});
//console.log(follower
//createBioPortrait(caroline.id);

processMentions()   

