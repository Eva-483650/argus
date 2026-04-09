<template>
  <div class="map-container">
    <div class="map-tip">
      <p>房价热力图</p>
    </div>
    <button class="logout-btn" @click="handleLogout">退出</button>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { loadBMapGL } from "../utils/loadBMapGL";
import { loadMapVGL } from "../utils/loadMapVGL";
import data from "../api/point.json";
const points = data;


const router = useRouter();

const handleLogout = () => {
  router.push({ name: 'Home' });
};

let map=null;


onMounted(async () => {
  const BMapGL = await loadBMapGL("1HCjQtCG2rxE32RvMZkAB4hSW3bAfZGR");
 const mapvgl = await loadMapVGL(); // 加载 MapVGL
const keyFrames = Array.from({ length: 13 }, (_, i) => {
  const percent = i / 12;
  const heading = i * 30;
  return {
    center: new BMapGL.Point(104.0668, 30.5728),
    zoom: 12,
    tilt: 80,
    heading: heading,
    percentage: percent
  };
});

const opts = {
  duration: 5000,      // 动画总时长（ms）
  delay: 0,              // 起始延迟
  iteration: 1 
};
 // 初始化地图
  map = new BMapGL.Map("map", { tilt: 45 });
  const center = new BMapGL.Point(104.0668, 30.5728);
  map.centerAndZoom(center, 12);
  map.enableScrollWheelZoom(true);
  map.enableContinuousZoom(true);
  map.setTilt(45);
  map.setHeading(0);
  map.setZoom(10);
  map.setMapStyleV2({
    styleId: '02a6702d736c7265dad65182efcd4390'
  });

  // ✅ 启动视角动画
  const animation = new BMapGL.ViewAnimation(keyFrames, opts);
  map.startViewAnimation(animation);


   const view = new mapvgl.View({ map });
   // 格式化柱状图数据
   const barData = []
    const list = []
    points.forEach((p) => {
      const value = p.total_price; // 或 p.unit_price、p.area 等
      barData.push({
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat]
        },
        properties: {
          count: value
        }
      });
      list.push(value);
    });

    // 柱状图配置项
    const options = {
      max: Math.max(...list),
      min: Math.min(...list),
      maxHeight: 20000,
      minHeight: 1000,
      gridSize: 800,
      style: 'normal', // 'grid' 也可
      riseTime: 1000,
      gradient: {
       0: 'rgb(50, 50, 256)',
            0.3: 'rgb(178, 202, 256)',
            1: 'rgb(250, 250, 256)'
    }
    };
    const grid = new mapvgl.HeatGridLayer(options);
    view.addLayer(grid);
    grid.setData(barData);

});
</script>

<style scoped>
/* 保持原有样式 */
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
}

.map-tip {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(30, 41, 59, 0.7);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 10;
}

.logout-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  z-index: 10;
  transition: background-color 0.3s ease;
}
.logout-btn:hover {
  background-color: #c82333;
}

/* 信息卡片样式 */
.info-card {
  width: 100%;
  font-family: "Arial", sans-serif;
}
.info-card h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}
.info-card p {
  margin: 2px 0;
  font-size: 14px;
  color: #555;
}


</style>