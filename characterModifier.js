
//import SocialPost from "social-post-api";
import runModel from "@pollinations/ipfs/awsPollenRunner.js";
import { IPFSWebState } from "@pollinations/ipfs/ipfsWebClient.js";
import fs from "fs";
import lodash from "lodash";
import fetch from "node-fetch";
const { zip } = lodash;

const promptPimpers = [
    prompt => `Very cute kid's film character anthro. ${prompt}, disney pixar zootopia character concept artwork, 3 d concept, detailed fur, animal, high detail iconic character for upcoming film, trending on artstation, character design, 3 d artistic render, highly detailed, octane, blender, cartoon, shadows, lighting`,
    // prompt => `${prompt}. a still from zootopia (2016), 4k bluray, pixar style`,
    // prompt => `High quality 3 d render hyperrealist very cute muted color fluffy! ${prompt}, highly detailed, vray smooth, in the style of detective pikachu, hannah yata charlie immer, soft indoor light, low angle, uhd 8 k, sharp focus`
]

const items = [
"with a halo",
"wearing nerd glasses",
"with a moustache",
"with an astronaut helmet"]

const animals = [
"a wolf",
"an owl",
"a gorilla"]

const characteristics = [
"an adventurer's outfit",
"a sporty outfit",
"a hipster outfit"
]


let prompts = []

for (const animal of animals) {
    for (const item of items) {
        for (const characteristic of characteristics) {
            for (const promptPimper of promptPimpers) {
                const prompt = promptPimper(`a ${characteristic} ${animal} ${item}`)
                prompts.push(prompt)
            }
        }
        
    }
}

// prompts = prompts.slice(0, 20)

// console.log("running on ", prompts.length)
async function createImages(prompts) {
    await getImage(prompts)
   
}


async function getImage(prompts, initImage=undefined) {

    const inputs = {
        prompts: prompts.join("\n"),
        // seed: Math.round(Math.random() * 100000),
        num_frames_per_prompt: 1,
        diffusion_steps: -50,
        prompt_scale: 15,
        width: 512,
        height: 512,
        init_image: initImage,
        init_image_strength: 0.35
    };

    console.log("inputs", inputs);
        try {
    const outputs = await runModel(inputs, 
        "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private"
    , false, {priority: 1});

    //console.log("outputs", outputs[".cid"], ,Object.entries(outputs.output))
    if (!outputs.output) {
        console.error("no outputs. skipping");
        return;
    }
    //console.log("inputs",outputs.input[".cid"])

    const urls = Object.entries(outputs.output)
                        .filter(([key]) => key.endsWith(".png") || key.endsWith(".jpg"))
                        .map(([_key, url]) => url);

    console.log("urls", urls)

    prompts.forEach(async  (prompt, i ) => {

        const url = urls[i];
        // console.log(prompt, url)
    
        if (!url || url.length === 0) {
            // console.error("no url", url)
            return;
        }
        console.log(prompt,url)
        // fetch url to buffer
        const buffer = await fetch(url).then(res => res.buffer());
    

        const filenamePrefix = initImage.split("=")[1];
        // save to path with the prompt as filename
        const path = `./images/${filenamePrefix}-${prompt.slice(0,200)}.png`;
        
        console.log("saving to", path)
        
        // create path if it doesn't exist
        fs.mkdirSync("./images", { recursive: true });

    
        fs.writeFileSync(path, buffer);
        return urls
        
    })

    
} catch (e) {
    console.error("error", e)
    return []
}


}


//  createImages(prompts)

const getCharacters = async () => {
    const characterData = await IPFSWebState("QmcBUEDUkV6guPZEZgEfNE5PksHeFsF8SnizL95VcBUw8S")
    console.log("characters", characterData)
    const animals = Object.keys(characterData)
    console.log("characterNames", animals)
    for (const animal of animals) {
        const initImages = Object.values(characterData[animal])
        for (const initImage of initImages) {
            for (const item of items) {
                for (const characteristic of characteristics) {
                    for (const promptPimper of promptPimpers) {
                        const prompt = promptPimper(`a ${animal} wearing ${characteristic} ${item}`)
                        console.log(prompt, initImage)
                        await getImage([prompt], initImage)
                    }
                }
            }
        }
    }
    console.log(prompts)
    return prompts
}

getCharacters()
