import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Head from "next/head";
import { useState } from "react";
import Predictions from "components/predictions";
import Error from "components/error";
import uploadFile from "lib/upload";
import naughtyWords from "naughty-words";
import Script from "next/script";
import seeds from "lib/seeds";
import pkg from "../package.json";
import sleep from "lib/sleep";
import { waitUntilSymbol } from "next/dist/server/web/spec-extension/fetch-event";

const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default function Home() {
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [scribbleExists, setScribbleExists] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [seed] = useState(seeds[Math.floor(Math.random() * seeds.length)]);
  const [initialPrompt] = useState(seed.prompt);
  const [scribble, setScribble] = useState(null);
  var [picStyle, setPicStyleStr] = useState(null);
  var [picArt, setPicArtStr] = useState(null);
  var [picComposition, setPicCompositionStr] = useState(null);
  var [picTech, setPicTechStr] = useState(null);
  var [picAtmosphere, setPicAtmosphereStr] = useState(null);
  var [picBackground, setPicBackgroundStr] = useState(null);
  var [picResolution, setPicResolutionStr] = useState(null);
  
  
// 1.风格
// Studio Ghibli（吉卜力工作室）
// Pixar（皮克斯）
// Cyberpunk（赛博朋克）
// Wasteland Punk（荒地朋克）
// Illustration（插图）
// Realism（现实主义）
// Landscape（景观）
// Surrealism（超现实主义）
// Watercolor painting（水彩画）
// Visual impact（视觉冲击）
// Ukiyoe（浮世绘）
// Neo-realism（新现实主义）
// Post-impressionism（后印象派）
// Architectural design（建筑设计）
// Watercolor（水彩画）
// Poster style（海报风格）
// Ink style（水墨风格）

// 2.著名艺术家
// Vincent van Gogh（文森特-凡高）
// Pablo Picasso（巴勃罗-毕加索）
// Wassily Kandinsky（瓦西里·康定斯基）
// Leonardo da Vinci（莱昂纳多-达芬奇）
// Max Ernst（马克斯-恩斯特）
// Salvador Dali（萨尔瓦多-达利）
// Norman Rockwell（诺曼-洛克威尔）
// Jackson Pollock（杰克逊-波洛克）
// Mattias Adolfsso（马蒂亚斯-阿道夫索）

// 3.构图
// close up（特写）
// full body（全身）
// portrait（肖像）
// symmetrical（对称的）
// wide view（广视角）
// bird view（鸟瞰）
// top view（俯视）
// up view（仰视）
// front view（正面图）
// headshot（大头照）
// ultrawide shot（超广角拍摄）
// extreme closeup（极端特写）
// macro shot（微距拍摄）

// 4.技术效果
// epic detail（史诗般的细节）
// dramatic contrast（戏剧性的对比）
// octane render（OC渲染器）
// unreal engine 5（虚幻引擎5）
// vray（vray渲染器）
// dof（透明度）
// 4k, 8k, 16k, 32k（分辨率）
// HD（高清）

// 5.氛围
// happy（快乐）
// excited（兴奋）
// angry（愤怒）
// sad（悲伤）
// disgusted（厌恶）
// surprised（惊讶）
// hopeful（充满希望）
// anxious（焦虑）
// elated（高兴的）
// fearful（恐惧的）
// hateful（可恨）
// moody（喜怒无常）
// dark（黑暗）
// brutal（粗暴的）


  const handleSubmit = async (e) => {
    e.preventDefault();

    // track submissions so we can show a spinner while waiting for the next prediction to be created
    setSubmissionCount(submissionCount + 1);

    let prompt = e.target.prompt.value
      .split(/\s+/)
      .map((word) => (naughtyWords.en.includes(word) ? "something" : word))
      .join(" ");

    if(picStyle && picStyle.length>0)
    {
      prompt += "," + picStyle;
    }

    if(picArt && picArt.length>0)
    {
      prompt += "," + picArt;
    }

    if(picComposition && picComposition.length>0)
    {
      prompt += "," + picComposition;
    }

    if(picTech && picTech.length>0)
    {
      prompt += "," + picTech;
    }

    if(picAtmosphere && picAtmosphere.length>0)
    {
      prompt += "," + picAtmosphere;
    }

    if(picBackground && picBackground.length>0)
    {
      prompt += "," + picBackground;
    }

    if(picResolution && picResolution.length>0)
    {
      prompt += "," + picResolution;
    }
    

    setError(null);
    setIsProcessing(true);

    let imageContents = '';
    if(photoMode) {
      let dataurl = document.querySelector("#dataurl");
      imageContents = dataurl.value;
    }else{
      imageContents = scribble
    }
    const fileUrl = await uploadFile(imageContents);

    const body = {
      prompt,
      image: fileUrl,
    };

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    let prediction = await response.json();

    setPredictions((predictions) => ({
      ...predictions,
      [prediction.id]: prediction,
    }));

    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(500);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      setPredictions((predictions) => ({
        ...predictions,
        [prediction.id]: prediction,
      }));
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
    }

    

    setIsProcessing(false);
  };
  
function treshold(canvas, level) {
  const pixels = _toPixels(canvas);

  if (level === undefined) {
    level = 0.5;
  }
  const thresh = Math.floor(level * 255);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let val;
    if (gray >= thresh) {
      val = 255;
    } else {
      val = 0;
    }
    pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
  }
};
function _toPixels (canvas) {
  if (canvas instanceof ImageData) {
    return canvas.data;
  } else {
    if (canvas.getContext('2d')) {
      return canvas
        .getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data;
    } else if (canvas.getContext('webgl')) {
      const gl = canvas.getContext('webgl');
      const len = gl.drawingBufferWidth * gl.drawingBufferHeight * 4;
      const data = new Uint8Array(len);
      gl.readPixels(
        0,
        0,
        canvas.width,
        canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
      return data;
    }
  }
};

  const takePicture = async() => {
    setPhotoTaken(true);
    let click_button = document.querySelector("#click-photo");
    let dataurl = document.querySelector("#dataurl");
    let contrastcanvas = document.querySelector("#contrastcanvas");
    let dataurl_container = document.querySelector("#dataurl-container");
    
    console.log('take pic');
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // start transform
    var ctxOrig = canvas.getContext("2d");
    var ctxOrigcontrasted = contrastcanvas.getContext("2d");
    var origBits = ctxOrig.getImageData(0, 0,canvas.width, canvas.height);
    //treshold(origBits, 0.77);
    ctxOrigcontrasted.putImageData(origBits, 0, 0);
    // end contrast

    let image_data_url = contrastcanvas.toDataURL('image/jpeg');
    console.log('image_data_url');

    dataurl.value = image_data_url;
    dataurl_container.style.display = 'block';
    video.style.display = 'none';
    contrastcanvas.style.display = 'block';
    //click_button.style.display = 'none';
  }
  const closeCamera = () => {
    setPhotoMode(false);
  }
  const openCamera = async () =>  {
    setPhotoMode(true);
    let stream = null;
    try {
    	stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode:"environment"}, audio: false });
    }
    catch(error) {
    	alert(error.message);
    	return;
    }
    setTimeout(() => {  
      let video =  document.querySelector("#video");
      video.srcObject = stream; }, 500);    
  };

  const handleStyleChange = (event) => {
    setPicStyleStr(event.target.value);
  }
  const handleArtChange = (event) => {
    setPicArtStr(event.target.value);
  }
  const handleCompositionChange = (event) => {
    setPicCompositionStr(event.target.value);
  }
  const handleTechChange = (event) => {
    setPicTechStr(event.target.value);
  }
  const handleAtmosphereChange = (event) => {
    setPicAtmosphereStr(event.target.value);
  }

  const handleBackgroundChange = (event) => {
    setPicBackgroundStr(event.target.value);
  }

  const handleResolutionChange = (event) => {
    setPicResolutionStr(event.target.value);
  }


  return (
    <div>
      <Head>
        <meta name="description" content={pkg.appMetaDescription} />
        <meta property="og:title" content={pkg.appName} />
        <meta property="og:description" content={pkg.appMetaDescription} />
        <meta
          property="og:image"
          content={`${HOST}/og-b7xwc4g4wrdrtneilxnbngzvti.png`}
        />
 
        <title>{pkg.appName}</title>s
      </Head>
      <main className="container max-w-[1024px] mx-auto p-5 ">
        <div className="container max-w-[512px] mx-auto">
          <hgroup>
            <h1 className="text-center text-5xl font-bold m-4">
              {pkg.appName}
            </h1>
            <p className="text-center text-xl opacity-60 m-4">
              {pkg.appSubtitle}
            </p>
          </hgroup>

          {photoMode == true && 
            <div>
              <video id="video" width="320" height="240" autoPlay></video>
              <button id="click-photo" onClick={takePicture} >拍照</button>
              <div id="dataurl-container">
                <canvas id="canvas" width="320" height="240"></canvas>
                <canvas id="contrastcanvas" width="320" height="240"></canvas>
                <div id="dataurl-header">Image Data URL</div>
                <textarea id="dataurl" readOnly></textarea>
              </div>
              <div id="contrast-container"></div>
              <button onClick={closeCamera}>重置并关闭摄像头</button>
            </div>
            
          }

          {photoMode == false && 
            <div  >
              <Canvas
              startingPaths={seed.paths}
              onScribble={setScribble}
              scribbleExists={scribbleExists}
              setScribbleExists={setScribbleExists}
              />   
              <button onClick={openCamera}>打开摄像头</button>
            </div>
          }
        
          <div>
            <div>
              <br></br>
              风格：
              <select id="dropdown" onChange={handleStyleChange}>
                <option value="">无</option>
                <option value="Studio Ghibli">吉卜力工作室</option>
                <option value="Pixar">皮克斯</option>
                <option value="Cyberpunk">赛博朋克</option>
                <option value="Wasteland Punk">荒地朋克</option>
                <option value="POPMART blind box">泡泡马特盲盒</option>
                <option value="Illustration">插图</option>
                <option value="Ink style">水墨风格</option>
                <option value="Chinese oil painting">中国油画</option>
                <option value="Tradition Chinese Ink Painting style">国风</option>
                <option value="Japanese comics/manga">日本漫画风格</option>
                <option value="film photography">电影镜头</option>
                <option value="black and white">黑白</option>
                <option value="Holographic">镭射</option>
                <option value="Fashion">时尚</option>
                <option value="ドット絵 and Pixel Art">像素画</option>
                <option value="Realism">现实主义</option>
                <option value="Landscape">景观</option>
                <option value="Surrealism">超现实主义</option>
                <option value="Watercolor painting">水彩画</option>
                <option value="Visual impact">视觉冲击</option>
                <option value="Ukiyoe">浮世绘</option>
                <option value="Neo-realism">新现实主义</option>
                <option value="Post-impressionism">后印象派</option>
                <option value="Architectural design">建筑设计</option>
                <option value="Poster style">海报风格</option>
                <option value="botw">旷野之息</option>
              </select>

              <br></br>
              <br></br>

              艺术家：
              <select id="dropdown" onChange={handleArtChange}>
                <option value="">无</option>
                <option value="Vincent van Gogh">文森特-凡高</option>
                <option value="Pablo Picasso">巴勃罗-毕加索</option>
                <option value="Wassily Kandinsky">瓦西里·康定斯基</option>
                <option value="Leonardo da Vinci">莱昂纳多-达芬奇</option>
                <option value="Max Ernst">马克斯-恩斯特</option>
                <option value="Salvador Dali">萨尔瓦多-达利</option>
                <option value="Norman Rockwell">诺曼-洛克威尔</option>
                <option value="Jackson Pollock">杰克逊-波洛克</option>
                <option value="Mattias Adolfsso">马蒂亚斯-阿道夫索</option>
                <option value="Hayao Miyazaki animation style">宫崎骏</option>
                <option value="Makoto Shinkai animation style">新海诚</option>
              </select>

              <br></br>
              <br></br>

              构图：
              <select id="dropdown" onChange={handleCompositionChange}>
                <option value="">无</option>
                <option value="closeup view">特写</option>
                <option value="full body">全身</option>
                <option value="portrait">肖像</option>
                <option value="symmetrical">对称的</option>
                <option value="wide view">广视角</option>
                <option value="bird view">鸟瞰</option>
                <option value="top view">俯视</option>
                <option value="up view">仰视</option>
                <option value="front view">正面图</option>
                <option value="headshot">大头照</option>
                <option value="ultrawide shot">超广角拍摄</option>
                <option value="extreme closeup">极端特写</option>
                <option value="macro shot">微距拍摄</option>
              </select>

              <br></br>
              <br></br>

              技术效果：
              <select id="dropdown" onChange={handleTechChange}>
                <option value="">无</option>
                <option value="epic detail">史诗般的细节</option>
                <option value="dramatic contrast">戏剧性的对比</option>
                <option value="3d,air blower,Soft Lights,octane render">OC渲染器</option>
                <option value="unreal engine 5">虚幻引擎5</option>
                <option value="maxon cinema vray,4D">vray渲染器</option>
                <option value="3D C4D">3D</option>
              </select>

              <br></br>
              <br></br>

              背景：
              <select id="dropdown" onChange={handleBackgroundChange}>
                <option value="">无</option>
                <option value="warm color background">暖色背景</option>
                <option value="cold color background">暖色背景</option>
                <option value="smooth color background">渐变背景</option>
                <option value="clean background">干净背景</option>
                <option value="bokeh background">虚化背景</option>
              </select>

              <br></br>
              <br></br>

              氛围：
              <select id="dropdown" onChange={handleAtmosphereChange}>
                <option value="">无</option>
                <option value="happy">快乐</option>
                <option value="excited">兴奋</option>
                <option value="angry">愤怒</option>
                <option value="sad">悲伤</option>
                <option value="disgusted">厌恶</option>
                <option value="surprised">惊讶</option>
                <option value="hopeful">充满希望</option>
                <option value="anxious">焦虑</option>
                <option value="elated">高兴的</option>
                <option value="fearful">恐惧的</option>
                <option value="hateful">可恨</option>
                <option value="moody">喜怒无常</option>
                <option value="dark">黑暗</option>
                <option value="brutal">粗暴的</option>
              </select>

              <br></br>
              <br></br>

              清晰度：
              <select id="dropdown" onChange={handleResolutionChange}>
                <option value="">无</option>
                <option value="FHD,1080P,2K,4K,8K">全高清.1080P,2K,4K,8K</option>
                <option value="8k smooth">8k流畅</option>
                <option value="HD">高清</option>
                <option value="high resolution">高分辨率</option>
                <option value="hyper quality">高品质</option>
                <option value="high detail">高细节</option>
              </select>
            </div>
          </div>

          <PromptForm
            initialPrompt={initialPrompt}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            scribbleExists={photoTaken || scribbleExists}
          />

          <Error error={error} />
        </div>

        <Predictions
          predictions={predictions}
          isProcessing={isProcessing}
          submissionCount={submissionCount}
        />
      </main>
      <Script src="https://js.upload.io/upload-js-full/v1" />
    </div>
  );
}
