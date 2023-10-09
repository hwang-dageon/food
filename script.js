var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(36.542699, 128.797338), //지도의 중심좌표.
  level: 8 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴



/*
**********************************************************
1. 지도 생성 & 확대 축소 컨트롤러
https://apis.map.kakao.com/web/sample/addMapControl/

*/

// 지도에 확대 축소 컨트롤을 생성
let zoomControl = new kakao.maps.ZoomControl();

// 지도의 우측에 확대 축소 컨트롤을 추가
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/
const dataSet = [
  {
    title: "안동 중앙 찜닭스",
    address: "경북 안동시 번영1길 51",
    url: "https://www.youtube.com/watch?v=luu2JCODVNs",
    category: "한식",
  },
  {
    title: "동경샌드",
    address: "경북 안동시 옥동1길 3",
    url: "https://www.youtube.com/watch?v=OgpXh-K3Cy0",
    category: "양식",
  },
  {
    title: "유아히어카페",
    address: "경북 안동시 강남로 277 1층 유아히어카페",
    url: "https://www.youtube.com/watch?v=Qr_VKjVg-cM",
    category: "디저트",
  },
];

/*
**********************************************************
3. 여러개 마커 표시하기
*/

for (var i = 0; i < dataSet.length; i++) {

  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
    map: map, // 마커를 표시할 지도
    position: dataSet[i].latlng, // 마커를 표시할 위치
  });
}


/*
**********************************************************
4. 주소로 장소 표시하기
*/


// 주소-좌표 변환 객체를 생성합니다
// var geocoder = new kakao.maps.services.Geocoder();

// for (var i = 0; i < dataSet.length; i ++) {
// // 주소로 좌표를 검색합니다, 주소를 dataSet의 주소를 넣어줍니다.
// geocoder.addressSearch(dataSet[i].address, 
//     function(result, status) {

//     // 정상적으로 검색이 완료됐으면 
//      if (status === kakao.maps.services.Status.OK) {

//         var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

//     // 마커를 생성합니다
//     var marker = new kakao.maps.Marker({
//         map: map, // 마커를 표시할 지도
//         position: coords, // 마커를 표시할 위치
// });
// }
// });
// }



/*
**********************************************************
4. 주소로 장소 표시하기 (비동기처리)
*/

// 주소-좌표 변환 객체함수
var geocoder = new kakao.maps.services.Geocoder();



function getCoordsByAddress(address) {
  // promise 형태로 반환
  return new Promise((resolve, reject) => {
    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        return resolve(coords);
      }
      reject(new Error("getCoordsByAddress Error: not valid Address"));
    });
  });
}



setMap(dataSet);


/*
**********************************************************
5. 인포윈도우 나타내기
*/

// 인포윈도우  html
function getCentent(data) {


  // 유튜브 썸네일 가져오기
  let replaceUrl = data.url;
  let finUrl = " ";
  replaceUrl = replaceUrl.replace("https://youtu.be/", '');
  replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", '');
  replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", '');
  finUrl = replaceUrl.split('&')[0];

  //html 인포윈도우 
  return `<div class="infowindow">
 <div class="infowindow-img-container">
   <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg" class="infowindow-img" class="infowindow-img" alt="">
 </div>
 <div class="infowindow-body">
   <h3 class="infowindow-title">${data.title}</h3>
   <p class="infowindow-address">${data.address}</p>
   <a href="${data.url}" class="infowindow-btn" target="_blank"> 영상보기 </a>
 </div>
</div>`;
}

async function setMap(dataSet) {
  for (var i = 0; i < dataSet.length; i++) {
    // 마커를 생성합니다
    let coords = await getCoordsByAddress(dataSet[i].address);
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords,// 마커를 표시할 위치
    });


    markerArray.push(marker);


    // 마커에 표시할 인포윈도우를 생성합니다 
    var infowindow = new kakao.maps.InfoWindow({
      content: getCentent(dataSet[i]), // 인포윈도우에 표시할 내용
    });

    infowindowArray.push(infowindow)//인포윈도우 배열이 생성될때마다 인포윈도우 개체 추가

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다 
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, coords)
    );
    kakao.maps.event.addListener(
      map, "click",
      makeOutListener(infowindow)
    );
  }
}


// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
// - 클릭시 다른 인포 윈도우 닫기
// - 클릭한 곳으로 지도 중심 옮기기

function makeOverListener(map, marker, infowindow, coords) {
  return function () {
    // - 클릭시 다른 인포 윈도우 닫기
    closeInfoWindow();
    infowindow.open(map, marker);
    //- 클릭한 곳으로 지도 중심 옮기기
    map.panTo(coords)
  };
}
let infowindowArray = [] //인포윈도우를 관리할 배열
function closeInfoWindow() {
  for (let infowindow of infowindowArray) {
    infowindow.close();
  }

}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}


/*
**********************************************************
6. 카테고리 분류하기
*/

// 카테고리
const categoryMap = {
  korea: "한식",
  america: "양식",
  wheat: "분식",
  dessert: "디저트",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

function categoryHandler(event) {
  const categoryId = event.target.id;
  const category = categoryMap[categoryId];

  // 데이터 분류
  let categorizedDataSet = [];
  for (let data of dataSet) {
    if (data.category === category) {
      categorizedDataSet.push(data);
    }
  }

  // 기존 마커 삭제
  closeMarker();


  // 기존 인포윈도우 닫기
  closeInfoWindow();
  // 실행
  setMap(categorizedDataSet)

}

let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null)
  }
}