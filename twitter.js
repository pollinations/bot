import { TwitterApi } from 'twitter-api-v2';
//import SocialPost from "social-post-api";
import runModel from "@pollinations/ipfs/awsPollenRunner.js";
import fetch from "node-fetch";
import readline from "readline-sync";
import pollenStore from "@pollinations/ipfs/pollenStore.js";
import credentials from "./credentials.js"




const appCredentials = {
    appKey: credentials.twitter_app_key,
    appSecret: credentials.twitter_app_secret,
};


async function getAccessToken() {
    const firstClient = new TwitterApi(appCredentials);

    const {url, oauth_token, oauth_token_secret} = await firstClient.generateAuthLink("https://pollinations.ai");
    console.log("auth link", url)

    const secondClient = new TwitterApi({ 
        ...appCredentials,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
    });

    const verifier = readline.question("Enter code verifier: ");
    const {client, accessToken, accessSecret } = await secondClient.login(verifier)
    return {client, accessToken, accessSecret};
}


const existingAccessCredentials = {
    accessToken: credentials.twitter_access_token,
    accessSecret: credentials.twitter_access_secret
  };

const accessCredentials = existingAccessCredentials ? existingAccessCredentials : await getAccessToken();

const client = new TwitterApi({
    ...appCredentials,
    ...accessCredentials
});

console.log(await client.v2.userByUsername('pollinations_ai', {"user.fields":"description"}))


const twitter = client.v2;

// Play with the built in methods
const { data: user } = await twitter.userByUsername('pollinations_ai', {"user.fields":"description"});

const userId = user.id;


const userName = `@${user.username}`;

// get the time 1 hour ago
const anHourAgo = new Date().getTime() - (1000 * 60 * 60 * 2);

async function processMentions(lastTime=anHourAgo) {
    console.log("loading mentions from", lastTime)
    const timeBeforeStarting = new Date().getTime() - 10000;
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
            const text = mention.text.replaceAll(userName, "").replace("create","").replaceAll("\"","").trim();
            const res = await createImageForMention({...mention, text});
        }
    }
    else {
        console.error("mentions are empty", mentionsData);
    }

    setTimeout(() => processMentions(timeBeforeStarting), 1000 * 20)
}


async function createImageForMention({author_id, text, tweetText=null, id: tweetId}) {

    if (tweetText === null) 
        tweetText = text;
    // get user name of the user who sent the tweet from the author_id
    const mentionName = "@" + (await twitter.user(author_id, {"user.fields":"username"})).data.username;

    console.log("creating image for ", mentionName);

    // remove username and create word from text
    const formattedText = text;

    const inputs = {
        Prompt: text,
        seed: Math.round(Math.random() * 100000),
    };

    console.log("inputs", inputs);

    const outputs = await runModel(inputs, 
        "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage"
    );

    //console.log("outputs", outputs[".cid"], ,Object.entries(outputs.output))
    if (!outputs.output) {
        console.error("no outputs. skipping");
        return;
    }
    //console.log("inputs",outputs.input[".cid"])

    const filenameAndURL = Object.entries(outputs.output).find(([key]) => key.endsWith(".png") || key.endsWith(".jpg"));
    
    if (!filenameAndURL) {
        console.error("no filenameAndURL. skipping");
        return;
    }

    const [filename, url] = filenameAndURL;

    console.log("created image", url)
    
    if (!url || url.length === 0) {
        console.error("no url", url)
        return;
    }
    // fetch url to buffer
    const buffer = await fetch(url).then(res => res.buffer());

    const type = filename.endsWith(".png") ? "png" : "jpg";

    console.log("uploading media")
    const mediaId = await client.v1.uploadMedia(buffer, {type});
    console.log("uploaded media", mediaId)


    // limit text to 240 characters
    tweetText = tweetText.substring(0, 240);

    const finalTweetText = `${mentionName} ${tweetText} #aiart #pollinations`;

    
    console.log("tweeting",finalTweetText, {media:{"media_ids":[mediaId]}});

    const t = `${mentionName} ${tweetText} #aiart #pollinations`;
    const payload = {media:{"media_ids":[mediaId]}}

    const response = tweetId ? await twitter.reply(t,tweetId, payload) : await twitter.tweet(t, payload);
    console.log("tweeted. response: ", response)
    return outputs
}


//const follower = await Promise.all(followers.data.map(async ({id}) => (await (await twitter.user(id, {"user.fields":"description"})).data.description)))

const {get, set} = pollenStore("bio_tweets");

// function check if id is in record.json and if not add it to the record.json

async function checkIfIdIsInRecord(id) {
    //console.log("get",id)
    return get(id);
}

async function writeIdToRecord(id) {
    console.log("set",id)
  await set(id, true);
}



async function createBioPortrait(userId) {
    const {data:user} = await twitter.user(userId, {"user.fields":"description"});
    console.log("user", user)
    await createImageForMention({author_id: userId, 
        text: ` Beautiful pixel art portrait of ${user.name} ${user.description}.`,
        tweetText: `"Portrait of ${user.name} ${user.description}". \n\n #myAIportrait`})
}

//processMentions()   

// const { data: caroline } = await twitter.userByUsername('killy44', {"user.fields":"description"});
// // //console.log(follower
// createBioPortrait(caroline.id);


let count=0;
async function processBios() {
    const timeline = await twitter.followers(userId,{"user.fields":"description","asPaginator":true, max_results: 1000})

   //do  {
        const followers = timeline.data.data;

        // reverse followers
        //followers.reverse();

        //console.log(timeline.next())
        for (const follower of followers) {
            //console.log("follower", follower)
            
            // skip heck if follower is in record.json
            if (await checkIfIdIsInRecord(follower.id)) {
               // console.log("skipping", follower.id, count++)
                continue
            };
            //await writeIdToRecord(follower.id)
            //const response = readline.question("create portrait?")
            //if (response ==="yes")
            await createBioPortrait(follower.id)
            await writeIdToRecord(follower.id)
        }
        //console.log("NEXT!!!")
        //await timeline.fetchNext()
    //} while (!timeline.done);
    setTimeout(() => processBios(), 1000 * 60)
}

processBios()

processMentions()   
