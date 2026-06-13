import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';


let camera;
let scene;
let renderer;
let model;
let colors = [];
let uniforms;
// 時間
let sec = 0;
let lack;
init();


function init() {

  //シェーダー
  uniforms = {
    u_ratio: { type: "f", value: 0.0 },
    u_color: { type: "f", value: 0.0},
    u_color1: { type: "f", value: 0.0},
    u_color2: { type: "f", value: 0.0}
  };
  console.log(uniforms.u_color.value);

  //シーンの作成
  scene = new THREE.Scene();

  //カメラの作成
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  //カメラ制御
  camera.position.set(200, 50, 50);




  //光源
  const dirLight = new THREE.SpotLight(0xffffff, 1.5);//color,強度
  dirLight.position.set(-20, 30, 30);
  scene.add(dirLight);

  //レンダラー
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);

  //glbファイルの読み込み
  const loader = new GLTFLoader();

  let data;

  loader.load('car2.glb', function (gltf) {
    model = gltf.scene;
    model.traverse((object) => { //モデルの構成要素
      if (object.isMesh) { //その構成要素がメッシュだったら
        object.material.trasparent = true;//透明許可
        object.material.opacity = 0.8;//透過
        object.material.depthTest = true;//陰影で消える部分
      }
    })

    const mesh = model.children[0].children[0];
    const mesh1 = model.children[0].children[1];
    const mesh2 = model.children[0].children[2];
    const mesh3 = model.children[0].children[3];
    const mesh4 = model.children[0].children[4];
    const mesh5 = model.children[1].children[0];
    const mesh6 = model.children[1].children[1];
    const mesh7 = model.children[1].children[2];

    car(mesh, 0);
    car(mesh1, 0);
    car(mesh2, 0);
    car(mesh3, 0);
    car(mesh4, 0);
    car(mesh5, 1);
    car(mesh6, 1);
    car(mesh7, 1);
    document.getElementById("WebGL-output").appendChild(renderer.domElement);
  });
  document.addEventListener("mouseup", (event) => {
    uniforms.u_color.value = 0;
    if(uniforms.u_color.value>0 || uniforms.u_color1.value>0 || uniforms.u_color2.value>0)
  {
    sec = 0.01;
    uniforms.u_color.value = sec;
    uniforms.u_color1.value = sec;
    uniforms.u_color2.value = sec;
   
  }
  lack = Math.floor(Math.random() * 3);

    time();

    _setAutoPlay();
    function _setDiffusion() {
      gsap.to(uniforms.u_ratio, {
        value: 5.0,
        duration: 2.7,
        ease: "power1.inOut",
        repeat: 1,
        yoyo: true
      });
      
    }

    function _setAutoPlay() {
      _setDiffusion();

      gsap.to(
        {},
        {
          ease: "none",
          duration: 4.2,
          repeat: 0,
          onRepeat: () => {
            _setDiffusion();
          }
        }
      );
    }
  });
}

function time()
{
  requestAnimationFrame(time);
  sec = sec + 0.005;
  console.log(lack);
  if(lack === 0){
    uniforms.u_color.value = sec;
  }else if(lack === 1){
    uniforms.u_color1.value = sec;
  }else{
    uniforms.u_color2.value = sec;
  }
}


//ﾊﾟｰﾃｨｸﾙ
function car(mesh, a) {
  // 車の座標
  const geometry = mesh.geometry;
  const position = geometry.getAttribute('position');
  const data = position.array; // gltf (BufferGeometry) の座標データ（？）
  const LENGTH = data.length;

  // パーティクル
  const SIZE = 40;
  const vertices = [];
  const sizes = 0.1;
  const geometry1 = new THREE.BufferGeometry();

  let material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.querySelector('#vertex-shader').innerHTML,
    fragmentShader: document.querySelector('#fragment-shader').innerHTML,
  });

  colors = [];
  for (let i = 0; i < LENGTH; i += 3) {
    const x = SIZE * data[i + 0];
    const y = SIZE * data[i + 1];
    const z = SIZE * data[i + 2];

    vertices.push(x, y, z);

    colors.push(Math.random(), Math.random(), Math.random());


  }

  geometry1.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry1.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const meshZ = new THREE.Points(geometry1, material);
  meshZ.rotation.x = Math.PI / 2;
  scene.add(meshZ);







  let rot = 0; // 角度
  let mouseX = 0; // マウス座標

  // マウス座標はマウスが動いた時のみ取得できる
  document.addEventListener("mousemove", (event) => {
    mouseX = event.pageX;
  });

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    requestAnimationFrame(tick);
    // マウスの位置に応じて角度を設定
    // マウスのX座標がステージの幅の何%の位置にあるか調べてそれを360度で乗算する
    const targetRot = (mouseX / window.innerWidth) * 360;
    // イージングの公式を用いて滑らかにする
    // 値 += (目標値 - 現在の値) * 減速値
    rot += (targetRot - rot) * 0.02;

    // ラジアンに変換する
    const radian = rot * Math.PI / 180;
    // 角度に応じてカメラの位置を設定
    camera.position.x = 800 * Math.sin(radian);
    camera.position.z = 800 * Math.cos(radian);
    // 原点方向を見つめる
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    
    
    // レンダリング
    renderer.render(scene, camera);

  
  }



}

