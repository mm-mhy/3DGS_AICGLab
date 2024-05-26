let url= "https://9st195je7388.vicp.fun"
// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x101010);
document.body.appendChild(renderer.domElement);

// 设置轨道控制
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// 设置灯光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);
//网格
const gridHelper = new THREE.GridHelper(20, 20,0x444444, 0x606060);
scene.add(gridHelper);
// 设置相机位置
camera.position.set(0, 0, 5);

function fetchPLYFile(){
    console.log("fetchPLYFile");
}
//页面加载从后端选取文件完成自动渲染
document.addEventListener('DOMContentLoaded', ()=> {
    //loadPLYFromURL();
    console.log("DOMContentLoaded");
  });

function loadPLYFromURL(){
    axios.post(url+"/edit", { responseType: 'arraybuffer' })
        .then(response => {
            const contents = response.data;
            const loader = new THREE.PLYLoader();
            const geometry = loader.parse(contents);

            // 检查几何体是否有顶点颜色
            let material;
            if (geometry.attributes.color) {
                material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
            } else {
                material = new THREE.PointsMaterial({ size: 0.01, color: 0x00ff00 });
            }

            const mesh = new THREE.Points(geometry, material);

            // 居中几何体
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            mesh.position.sub(center);

            scene.add(mesh);
        })
        .catch(error => {
            console.error('Error loading PLY file:', error);
        });
}
//按钮点击本地上传ply进行渲染
function loadPLY(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const loader = new THREE.PLYLoader();
        const geometry = loader.parse(contents);

        // Check if the geometry has vertex colors
        let material;
        if (geometry.attributes.color) {
            material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
        } else {
            material = new THREE.PointsMaterial({ size: 0.01, color: 0xbbbbbb });
        }

        const mesh = new THREE.Points(geometry, material);

        // Center the geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        mesh.position.sub(center);

        scene.add(mesh);
    };
    reader.readAsArrayBuffer(file);
}
document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.ply')) {
        // Clear previous mesh
        scene.children.forEach((child, index) => {
            if (child instanceof THREE.Points) {
                scene.remove(child);
            }
        });
        loadPLY(file);
    }
});



function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 处理窗口调整大小
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
