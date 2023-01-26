//custom protocol for getting the ai generation from custom StableDiffusion server

const ClientSocket = require("./clientSocket.js");
const net = require("net");
const { rejects } = require("assert");

module.exports = class AIGenerationProtocol extends ClientSocket
{
    constructor(host, port)
    {
        super(host, port);
    }

    wait_for_ready()
    {
        console.log("Waiting for ready");
        //wait for the server to send a message starting with "READY"
        return new Promise((resolve, reject) =>
        {
            try
            {
                this.socket.on('data', (data) =>
                {
                    if (data.toString().startsWith("READY"))
                    {
                        console.log("Recieved ready");
                        resolve(data);
                    }
                });
            } catch (error)
            {
                reject(error);
            }
        });
    }

    send_ready()
    {
        console.log("Sending ready");
        //send a message to the server starting with "READY"
        this.socket.write("READY");
    }

    send_message(message)
    {
        //send a message to the server
        this.socket.write(message);
    }

    wait_for_ack()
    {
        //wait for the server to send a message starting with "ACK"
        console.log("Waiting for ack");
        return new Promise((resolve, reject) =>
        {
            try
            {
                this.socket.on('data', (data) =>
                {
                    if (data.toString().startsWith("ACK"))
                    {
                        console.log("Recieved ack: " + data.toString());
                        resolve(data);
                    }
                });
            } catch (error)
            {
                reject(error);
            }
        });
    }

    wait_for_size()
    {
        console.log("Waiting for size");
        //wait for the server to send a message starting with "SIZE"
        return new Promise((resolve, reject) =>
        {
            try
            {
                this.socket.on('data', (data) =>
                {
                    if (data.toString().startsWith("SIZE"))
                    {
                        console.log("Recieved size: " + data.toString());
                        resolve(data);
                    }
                });
            } catch (error)
            {
                reject(error);
            }
        });
    }

    wait_for_text()
    {
        //wait for the server to send a message starting with "TEXT"
        return new Promise((resolve, reject) =>
        {
            try
            {
                console.log("Waiting for text");
                this.socket.on('data', (data) =>
                {
                    if (data.toString().startsWith("TEXT"))
                    {
                        console.log("Recieved text: " + data.toString());
                        resolve(data);
                    }
                });
            } catch (error)
            {
                reject(error);
            }
        });
    }

    wait_for_server_to_generate_image()
    {
        console.log("Waiting for server to generate image");
        //wait for ready message from server before returning
        return this.wait_for_ready().then(() =>
        {
            console.log("Recieved ready");
        });
    }

    wait_for_image()
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                let image;
                this.socket.connect(this.port, this.host, () => { fs.createReadStream(image).pipe(this.socket); });
                this.socket.on('end', () => { resolve(image); });
            } catch (error)
            {
                reject(error);
            }
        });
    }


    convert_image_from_base64(image)
    {
        //convert the provided image from base64 to a file and return the file path
        return new Promise((resolve, reject) =>
        {
            try
            {
                const fs = require("fs");
                const path = require("path");
                const base64 = image.toString();
                const buffer = Buffer.from(base64, "base64");
                fs.writeFileSync(path.join(__dirname, "..", "..", "..", "media", "image", "temp.png"), buffer);
                const file_path = path.join(__dirname, "..", "..", "..", "media", "image", "temp.png");
                resolve(file_path);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    //helper function to send a request to the server to generate an image
    //and return the image
    async generate_image(
        prompt,
        neg_prompt,
        guidance_scale = 7.5,
        height = 256,
        width = 256,
        num_inference_steps = 50,
        num_imgs_per_prompt = 1,
        flags = "--safe-checker")
    {
        //wait for the server to be connected
        await this.socket.on('connect', () => { });
        // check if the flags contain the safe checker flag
        // if not, add it
        if (!flags.includes("--safe-checker"))
        {
            flags += " --safe-checker";
        }
        //send a message to the server starting with "GENERATE"
        let message = "GENERATE;" +
            "PROMPT:" + prompt +
            ";NEG_PROMPT:" + neg_prompt +
            ";GUIDANCE_SCALE:" + guidance_scale +
            ";HEIGHT:" + height +
            ";WIDTH:" + width +
            ";NUM_INFERENCE_STEPS:" + num_inference_steps +
            ";NUM_IMGS_PER_PROMPT:" + num_imgs_per_prompt +
            ";FLAGS:" + flags;
        this.send_message(message);
        //wait for the server to send a message starting with "ACK IMAGE"
        await this.wait_for_ack().then(() =>
        {
            console.log("Recieved ack");
        }).catch((err) => { console.log(err); });
        //wait for image generation to finish
        await this.wait_for_server_to_generate_image();
        //wait for size message from server
        let size = await this.wait_for_size().catch((err) => { console.log(err); });

        //wait for .1 seconds
        setTimeout(() => { }, 100);
        //send ready message to server
        this.send_ready();
        //wait for the image data from the server
        let image = await this.wait_for_image().catch((err) => { console.log(err); })
        //convert the image from base64 into an image that can be used by discord
        let imagepath = await this.convert_image_from_base64(image);
        //send ready message to server
        this.send_ready();
        //return the image
        return imagepath;
    }
}