import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';

const contents = d3.select('#chart--wrapper');
const dataSelect = document.getElementById('data--select');
const svg = contents.append('svg');
const padding = 30;
// tooltipを追加
const tooltip = d3.select('body').append('div').attr('class', 'chart--tooltip');
const bisectDate = d3.bisector(function (d) { return d.date; }).left;
// グラデーションの色
let color = d3.rgb('#85a7cc');

d3.json('./assets/data/test.json')
.then(function (datasets) {
  let x;
  let y;
  let xScale;
  let yScale;
  let width;
  let height;
  let line;
  let path;
  let area;
  let lineArea;
  let linearGradient;
  let dataset;
  let axisx;
  let axisy;
  let focus;
  let focusLine;
  let focusPoint;
  let overlay;
  let isAnimate = false;
  let isInit = false;
  // 標準時間を取得
  let timeparser = d3.timeParse('%Y/%m/%d');
  // x軸の目盛りの表示フォーマット
  let format = d3.timeFormat('%Y/%m');

  const lineChart = {
    initialize() {
      // 表示するデータ
      datasets = datasets.map(function (data) {
        return data.map(function (d) {
          // 日付のデータをパース
          return {
            date: timeparser(d.date),
            value: d.value
          };
        });
      });
      // 初期表示用のデータ
      dataset = datasets[0];
      // レンダリング
      this.render();
      // アップデート
      this.update();

      isInit = true;
      // アニメーション
      this.animate();
      // リサイズ時の処理
      this.resize();
      // データ変更の処理
      this.dataChange();
      // tooltipを設定
      this.setTooltip();
      // マウスイベントをバインド
      this.mouseEvent();
    },
    render() {
      // パス要素を追加
      path = svg.append('path');

      lineArea = svg.append('path');

      linearGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'linear-gradient')
        .attr('gradientTransform', 'rotate(90)');

      linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color.brighter(1.5));

      linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255,255,255,0)');

      // svg要素にg要素を追加しクラスを付与しxに代入
      x = svg.append('g')
        .attr('class', 'axis axis-x');

      // svg要素にg要素を追加しクラスを付与しyに代入
      y = svg.append('g')
        .attr('class', 'axis axis-y');
      
      // フォーカス要素のグループを追加
      focus = svg.append('g')
        .attr('class', 'focus')
        .style('visibility', 'hidden');

      // フォーカス時のY軸を追加
      focusLine = focus.append('line');

      // フォーカス時のポイントを追加
      focusPoint = focus.append('circle')
        .attr('r', 4)
        .attr('fill', '#fff')
        .attr('stroke', color)
        .attr('stroke-width', 2);

      // オーバーレイ要素を追加
      overlay = svg.append('rect');
    },
    update() {
      // グラフの幅
      width = contents.node().clientWidth - padding;
      // グラフの高さ
      height = contents.node().clientHeight - padding;
      // X軸Y軸を追加
      this.addScales(false);
      // ラインを追加
      this.addLine();
      // エリアを追加
      this.addArea();
    },
    resize() {
      let self = this;
      window.addEventListener('resize', function () {
        // アップデート
        self.update();
      });
    },
    dataChange() {
      let self = this;
      dataSelect.addEventListener('change', function () {
        self.animate();
      });
    },
    getLine() {
      if (!isInit) {
        return d3.line()
          // lineのX軸をセット
          .x(function (d) {
            return xScale(d.date);
          })
          // lineのY軸をセット
          .y(yScale(0))
          // カーブを設定
          .curve(d3.curveCatmullRom.alpha(0.4));
      } else {
        return d3.line()
          // lineのX軸をセット
          .x(function (d) {
            return xScale(d.date);
          })
          // lineのY軸をセット
          .y(function (d) {
            return yScale(d.value);
          })
          // カーブを設定
          .curve(d3.curveCatmullRom.alpha(0.4));
      }
    },
    getArea() {
      if (!isInit) {
        return d3.area()
          .x(function (d) {
            return xScale(d.date);
          })
          .y1(yScale(0))
          .y0(yScale(0))
          // カーブを設定
          .curve(d3.curveCatmullRom.alpha(0.4));
      } else {
        return d3.area()
          .x(function (d) {
            return xScale(d.date);
          })
          .y1(function (d) {
            return yScale(d.value);
          })
          .y0(yScale(0))
          // カーブを設定
          .curve(d3.curveCatmullRom.alpha(0.4));
      }
    },
    addScales(animation) {
      // x軸の目盛りの量
      let xTicks = (window.innerWidth < 768) ? 6 : 12;
      // X軸を時間のスケールに設定する
      xScale = d3.scaleTime()
        // 最小値と最大値を指定しX軸の領域を設定する
        .domain([
          // データ内の日付の最小値を取得
          d3.min(dataset, function (d) {
            return d.date;
          }),
          // データ内の日付の最大値を取得
          d3.max(dataset, function (d) {
            return d.date;
          })
        ])
        // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
        .range([padding, width]);


      // Y軸を値のスケールに設定する
      yScale = d3.scaleLinear()
        // 最小値と最大値を指定しX軸の領域を設定する
        .domain([
          // 0を最小値として設定
          0,
          // データ内のvalueの最大値を取得
          d3.max(dataset, function (d) {
            return d.value;
          })
        ])
        // SVG内でのY軸の位置の開始位置と終了位置を指定しY軸の幅を設定する
        .range([height, padding]);

      // scaleをセットしてX軸を作成
      axisx = d3.axisBottom(xScale)
        // グラフの目盛りの数を設定
        .ticks(xTicks)
        // 目盛りの表示フォーマットを設定
        .tickFormat(format);

      // scaleをセットしてY軸を作成
      axisy = d3.axisLeft(yScale);

      if (!animation) {
        // X軸の位置を指定し軸をセット
        x.attr('transform', 'translate(' + 0 + ',' + (height) + ')')
          .call(axisx);
        // Y軸の位置を指定し軸をセット
        y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
          .call(axisy);
      } else {
        // X軸の位置を指定し軸をセット
        x.attr('transform', 'translate(' + 0 + ',' + (height) + ')')
          .transition()
          .duration(1500)
          .ease(d3.easeExpInOut)
          .call(axisx);
        // Y軸の位置を指定し軸をセット
        y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
          .transition()
          .duration(1500)
          .ease(d3.easeExpInOut)
          .call(axisy);
      }
    },
    addLine() {
      // lineを生成
      line = this.getLine();

      path
        // dataをセット
        .datum(dataset)
        // 塗りつぶしをなしに
        .attr('fill', 'none')
        // strokeカラーを設定
        .attr('stroke', color)
        // strokeカラーを設定
        .attr('stroke-width', 2)
        .attr('stroke-dashoffset', 0)
        .attr('stroke-dasharray', 0)
        // d属性を設定
        .attr('d', line);
    },
    addArea() {
      area = this.getArea();

      lineArea
        .datum(dataset)
        .attr('d', area)
        .style('fill', 'url(#linear-gradient)');
    },
    setTooltip() {
      // オーバーレイ要素を設定
      overlay
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height);

      // フォーカスした際のY軸を設定
      focusLine
        .style('stroke', '#ccc')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '2')
        .attr('class', 'x-hover-line hover-line')
        .attr('y1', padding)
        .attr('y2', height);
    },
    mouseEvent() {
      overlay.on('mousemove', this.handleMouseMove)
        .on('mouseout', this.handleMouseOut);
    },
    handleMouseMove() {
      if (!isAnimate) {
        let x0 = xScale.invert(d3.mouse(this)[0]);
        let i = bisectDate(dataset, x0, 1);
        let d0 = dataset[i - 1];
        let d1 = dataset[i];
        let d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        let format = d3.timeFormat('%Y/%m/%d');

        let tooltipY = (d3.event.pageY - 40);
        let tooltipX = (d3.event.pageX + 20);

        if ((window.innerWidth - 160) < tooltipX) {
          tooltipX = (d3.event.pageX - 200);
        }

        tooltip
          .html('')
          .style('visibility', 'visible')
          .style('top', tooltipY + 'px')
          .style('left', tooltipX + 'px');

        tooltip
          .append('div')
          .attr('class', 'tooltip--time')
          .html(format(d.date) + '<br>' + d.value + '<small>%</small>');

        focus
          .style('visibility', 'visible')
          .attr('transform', 'translate(' + xScale(d.date) + ',' + 0 + ')');

        focusPoint.attr('transform', 'translate(' + 0 + ',' + yScale(d.value) + ')');
      }
    },
    handleMouseOut(d, i) {
      tooltip.style('visibility', 'hidden');
      focus.style('visibility', 'hidden');
    },
    animate() {
      let self = this;
      let dLine0 = path.attr('d');
      let dArea0 = lineArea.attr('d');

      dataset = datasets[dataSelect.value];

      self.addScales(true);

      let dLine1 = self.getLine();
      let dArea1 = self.getArea();

      isAnimate = true;
      path
        .attr('d', dLine0)
        .transition()
        .duration(1500)
        .ease(d3.easeExpInOut)
        .attrTween('d', function () {
          return interpolatePath(dLine0, dLine1(dataset));
        });

      lineArea.attr('d', dArea0)
        .transition()
        .delay(50)
        .duration(1500)
        .ease(d3.easeExpInOut)
        .attrTween('d', function () {
          return interpolatePath(dArea0, dArea1(dataset));
        })
        .on('end', function () {
          isAnimate = false;
        });
      
      self.setTooltip();
    }
  };
  // 各オブジェクトを初期化
  lineChart.initialize();
});
