import React, { Component } from "react";
import * as d3 from "d3";

import "./BarChart.css";

// ***** Default svg data
const defaultSvgWidth = 640;
const defaultSvgHeight = 580;
const defaultSvgHeightNega = 0;
const defaultSvgMargin = { top: 20, right: 5, bottom: 20, left: 35 };
const defaultSvgScrollHeight = 60;
const defaultPadding = 0.2;
const defaultSliceWidth = 5;

class BarChart extends Component {
  constructor(props) {
    super(props);

    const svgWidth = props.width === undefined ? defaultSvgWidth : props.width;
    const svgHeight =
      props.height === undefined ? defaultSvgHeight : props.height;
    const svgHeightNega =
      props.heightnega === undefined ? defaultSvgHeightNega : props.heightnega;
    const svgMargin =
      props.margin === undefined ? defaultSvgMargin : props.margin;
    const svgScrollHeight =
      props.scrollHeight === undefined
        ? defaultSvgScrollHeight
        : props.scrollHeight;
    const svgScrollMargin = { ...svgMargin, bottom: 0 };
    const padding =
      props.padding === undefined ? defaultPadding : props.padding;
    const sliceWidth =
      props.bars === undefined ? defaultSliceWidth : props.bars;

    // console.log(props.valueMin);
    // console.log(props.valueMax);
    const temp =
      svgHeight -
      svgMargin.bottom -
      svgScrollHeight -
      (svgMargin.top + svgScrollHeight + 13);
    const temp1 = temp * (1 + props.valueMin / props.valueMax);
    this.state = {
      svgWidth,
      svgHeight,
      svgHeightNega,
      svgMargin,
      svgScrollHeight,
      svgScrollMargin,
      padding,
      sliceStart: 0,
      sliceWidth,
      xScale: d3
        .scaleBand()
        .range([svgMargin.left, svgWidth - svgMargin.right])
        .padding(padding),
      yScaleAxis: d3
        .scaleLinear()
        .range([
          svgHeight - svgMargin.bottom - svgScrollHeight,
          svgMargin.top + svgScrollHeight + 13
        ]),
      yScaleAxisNega: d3
        .scaleLinear()
        .range([
          svgHeight -
            svgMargin.bottom -
            svgScrollHeight -
            13 +
            svgHeight -
            svgScrollHeight * 2 -
            svgMargin.top -
            svgMargin.bottom -
            temp1,
          svgMargin.top +
            svgScrollHeight +
            svgHeight -
            svgScrollHeight * 2 -
            svgMargin.top -
            svgMargin.bottom
        ]),
      // yScaleAxisNega: d3
      //   .scaleLinear()
      //   .range([
      //     -500* valueMin / valueMax,
      //     svgHeight - svgMargin.bottom - svgScrollHeight
      //   ]),
      negaHeight: (temp * props.valueMin) / props.valueMax,
      xAxisRef: null,
      yAxisRef: null,
      yAxisRefNega: null,
      yAxisGridRef: null,
      yAxisGridRefNega: null,
      chartBarsRef: null,
      xScrollScale: d3
        .scaleBand()
        .range([svgScrollMargin.left, svgWidth - svgScrollMargin.right])
        .padding(padding),
      yScrollScale: d3.scaleLinear().range([svgScrollHeight, svgMargin.top]),
      scrollRef: null,
      scrollSelectorWidth: 0,
      scrollSelectorMinX: 0,
      scrollSelectorMaxX: 0,
      scrollBandWidth: 0,
      scrollSelectorX: svgScrollMargin.left,

      bars: [],
      scrollBars: [],
      data: props.data
    };

    // svg.append("g")
    //   .attr("class", "grid")
    //   .call(gridlines);

    this.xAxis = d3.axisBottom().scale(this.state.xScale);
    this.yAxis = d3
      .axisLeft()
      .scale(this.state.yScaleAxis)
      .tickFormat(d => `${d}%`);
    this.yAxisNega = d3
      .axisLeft()
      .scale(this.state.yScaleAxisNega)
      .tickFormat(d => `${d != 0 ? d + "%" : ""}`);
    this.yAxisGrid = d3
      .axisLeft(this.state.yScaleAxis)
      .ticks(10)
      .tickSize(-defaultSvgWidth)
      .tickFormat("");
    this.yAxisGridNega = d3
      .axisLeft(this.state.yScaleAxisNega)
      .ticks(10)
      .tickSize(-defaultSvgWidth)
      .tickFormat("");
    this.chartBars = d3.select("#vis-container").selectAll(".bar");
    const bars = this.calculateBars();
    const scrollBars = this.calculateScrollBars();
    const selector = this.calculateScrolSellector(scrollBars.length);
    const states = { ...selector, bars, scrollBars };
    this.state = { ...this.state, ...states };
  }

  xAxisRef = element => {
    this.setState({ xAxisRef: element });
    d3.select(element).call(this.xAxis);
  };

  yAxisRef = element => {
    this.setState({ yAxisRef: element });
    d3.select(element).call(this.yAxis);
  };

  yAxisRefNega = element => {
    this.setState({ yAxisRefNega: element });
    d3.select(element).call(this.yAxisNega);
  };

  chartBarsRef = element => {
    this.setState({ chartBarsRef: element });
    //console.log(d3.select(element));
    //d3.select(element).call(this.chartBars);
  };

  yAxisGridRef = element => {
    this.setState({ yAxisGridRef: element });
    d3.select(element).call(this.yAxisGrid);
  };

  yAxisGridRefNega = element => {
    this.setState({ yAxisGridRefNega: element });

    d3.select(element).call(this.yAxisGridNega);
  };

  scrollRef = element => {
    this.setState({ scrollRef: element });
    d3.select(element).call(d3.drag().on("drag", this.scrollDrag));
  };

  scrollDrag = () => {
    let newX = this.state.scrollSelectorX + d3.event.dx;
    let newSlice = 0;
    const oldSlice = this.state.sliceStart;

    if (newX > this.state.scrollSelectorMaxX) {
      newX = this.state.scrollSelectorMaxX;
    } else if (newX < this.state.scrollSelectorMinX) {
      newX = this.state.scrollSelectorMinX;
    }

    newSlice = newX - this.state.scrollSelectorMinX;
    newSlice = Math.round(newSlice / this.state.scrollBandWidth);

    if (newSlice !== oldSlice) {
      const bars = this.calculateBars(newSlice);
      this.setState({ scrollSelectorX: newX, sliceStart: newSlice, bars });
    } else {
      this.setState({ scrollSelectorX: newX });
    }
  };

  calculateBars = newSliceStart => {
    // console.log("state");
    // console.log(this.state.data);
    const { data } = this.state;
    let {
      xScale,
      // yScale,
      yScaleAxis,
      yScaleAxisNega,
      sliceStart,
      sliceWidth
      // svgMargin,
      // svgScrollHeight
    } = this.state;

    if (newSliceStart !== undefined) {
      sliceStart = newSliceStart;
    }
    // const datainfo = data.map(d => d.info1);
    const labelDomain1 = data
      .map(d => d.info1)
      .slice(sliceStart, sliceStart + sliceWidth)
      .map(d => d.label);
    const labelDomain2 = data
      .map(d => d.info2)
      .slice(sliceStart, sliceStart + sliceWidth)
      .map(d => d.label);
    const max1 = d3.max(data.map(d => d.info1), d => d.value);
    const max2 = d3.max(data.map(d => d.info2), d => d.value);
    const valueMax =
      ((max1 > max2 ? max1 : max2) < 0 ? 0 : max1 > max2 ? max1 : max2) * 1.035;
    const min1 = d3.min(data.map(d => d.info1), d => d.value);
    const min2 = d3.min(data.map(d => d.info2), d => d.value);
    const valueMin =
      ((min1 < min2 ? min1 : min2) > 0 ? 0 : min1 < min2 ? min1 : min2) * 1.035;

    xScale.domain(labelDomain1 < labelDomain2 ? labelDomain1 : labelDomain2);
    //yScale.domain([0, valueMax]);
    yScaleAxis.domain([0, valueMax]);
    yScaleAxisNega.domain([valueMin, 0]);
    // yScaleAxisNega.domain([valueMin, 0]);
    this.state.svgHeightNega =
      (-(yScaleAxis(0) - yScaleAxis(valueMax)) * valueMin) / valueMax;
    const bars = data
      .slice(sliceStart, sliceStart + sliceWidth)
      .map((d, index) => {
        const x = xScale(d.info1.label);
        const ifnega1 = d.info1.value < 0 ? false : true;
        const ifnega2 = d.info2.value < 0 ? false : true;
        const y1 = ifnega1 ? yScaleAxis(d.info1.value) : yScaleAxis(0);
        const y2 = ifnega2 ? yScaleAxis(d.info2.value) : yScaleAxis(0);
        const width = xScale.bandwidth() / 2;
        // const height1 =
        //   svgHeight / 2 - svgMargin.bottom - yScale(Math.abs(d.info1.value));
        const height1 = ifnega1
          ? yScaleAxis(0) - yScaleAxis(d.info1.value)
          : yScaleAxis(0) - yScaleAxis(Math.abs(d.info1.value));
        const height2 = ifnega2
          ? yScaleAxis(0) - yScaleAxis(d.info2.value)
          : yScaleAxis(0) - yScaleAxis(Math.abs(d.info2.value));

        const fill1 = d.info1.color;
        const fill2 = d.info2.color;
        const value1 = d.info1.value;
        const value2 = d.info2.value;

        // const y = 400;
        return {
          index,
          x,
          y1,
          y2,
          ifnega1,
          ifnega2,
          height1,
          height2,
          width,
          fill1,
          fill2,
          value1,
          value2
        };
      });

    return bars;
  };

  calculateScrollBars = () => {
    const { data } = this.state;
    const { xScrollScale, yScrollScale, svgHeight } = this.state;
    const scrolllabelDomain1 = data.map(d => d.info1.label);
    const scrolllabelDomain2 = data.map(d => d.info2.label);
    const max1 = d3.max(data.map(d => d.info1), d => d.value);
    const max2 = d3.max(data.map(d => d.info2), d => d.value);
    const valueMax = max1 > max2 ? max1 : max2;
    const min1 = d3.min(data.map(d => d.info1), d => d.value);
    const min2 = d3.min(data.map(d => d.info2), d => d.value);
    const valueMin = min1 < min2 ? min1 : min2;
    xScrollScale.domain(
      scrolllabelDomain1 < scrolllabelDomain2
        ? scrolllabelDomain1
        : scrolllabelDomain2
    );
    yScrollScale.domain([valueMin < 0 ? valueMin : 0, valueMax, valueMax]);

    const scrollBars = data
      .map(d => d)
      .map((d, index) => {
        // const valueinfo1 = d.info1.value > 0 ? d.info1.value : -d.info1.value;
        // const valueinfo2 = d.info2.value > 0 ? d.info2.value : -d.info2.value;
        const ifnega1 = d.info1.value > 0 ? true : false;
        const ifnega2 = d.info2.value > 0 ? true : false;
        const scrollX = xScrollScale(d.info1.label);
        const scrollY1 = ifnega1
          ? yScrollScale(d.info1.value)
          : yScrollScale(0);
        const scrollY2 = ifnega2
          ? yScrollScale(d.info2.value)
          : yScrollScale(0);
        const scrollWidth = xScrollScale.bandwidth() / 2;
        const scrollHeight1 = ifnega1
          ? yScrollScale(0) - yScrollScale(d.info1.value)
          : yScrollScale(0) - yScrollScale(Math.abs(d.info1.value));
        const scrollHeight2 = ifnega2
          ? yScrollScale(0) - yScrollScale(d.info2.value)
          : yScrollScale(0) - yScrollScale(Math.abs(d.info2.value));
        const scrollFill = "#cccccc";

        return {
          index,
          scrollX,
          scrollY1,
          scrollY2,
          ifnega1,
          ifnega2,
          scrollWidth,
          scrollHeight1,
          scrollHeight2,
          scrollFill
        };
      });

    return scrollBars;
  };

  calculateScrolSellector = scrollBarsLength => {
    const { sliceWidth, svgWidth, svgScrollMargin } = this.state;

    const scaleWidth = svgWidth - svgScrollMargin.right - svgScrollMargin.left;
    const scrollSelectorWidth = Math.round(
      (sliceWidth / scrollBarsLength) * scaleWidth
    );
    const scrollSelectorMinX = svgScrollMargin.left;
    const scrollSelectorMaxX =
      svgWidth - svgScrollMargin.right - scrollSelectorWidth;
    const scrollBandWidth = Math.round(scaleWidth / scrollBarsLength);

    return {
      scrollSelectorWidth,
      scrollSelectorMinX,
      scrollSelectorMaxX,
      scrollBandWidth
    };
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      data: nextProps.data
    };
  }

  calculateChart = () => {
    const bars = this.calculateBars();
    const scrollBars = this.calculateScrollBars();
    const selector = this.calculateScrolSellector(scrollBars.length);
    const states = { ...selector, bars, scrollBars };
    this.setState({ ...states });
  };

  componentDidUpdate(props, state) {
    if (props.data !== this.props.data) {
      const temp =
        this.state.svgHeight -
        this.state.svgMargin.bottom -
        this.state.svgScrollHeight -
        (this.state.svgMargin.top + this.state.svgScrollHeight + 13);
      const temp1 = temp * (1 + this.props.valueMin / this.props.valueMax);
      this.state.yScaleAxisNega = d3
        .scaleLinear()
        .range([
          this.state.svgHeight -
            this.state.svgMargin.bottom -
            this.state.svgScrollHeight -
            13 +
            this.state.svgHeight -
            this.state.svgScrollHeight * 2 -
            this.state.svgMargin.top -
            this.state.svgMargin.bottom -
            temp1,
          this.state.svgMargin.top +
            this.state.svgScrollHeight +
            this.state.svgHeight -
            this.state.svgScrollHeight * 2 -
            this.state.svgMargin.top -
            this.state.svgMargin.bottom
        ]);
      this.yAxisGridNega = d3
        .axisLeft(this.state.yScaleAxisNega)
        .ticks(10)
        .tickSize(-defaultSvgWidth)
        .tickFormat("");
      this.yAxisNega = d3
        .axisLeft()
        .scale(this.state.yScaleAxisNega)
        .tickFormat(d => `${d != 0 ? d + "%" : ""}`);
      this.calculateChart();
      this.state.negaHeight =
        (temp * this.props.valueMin) / this.props.valueMax;

      // console.log("temp2");
      // console.log(this.state.negaHeight);
      var canvas = d3.select("#vis-container");
      var bars = canvas.selectAll(".bar");
      bars
        .enter()
        .transition()
        .duration(2500);
      console.log("bars");
      console.log(bars);
    }
    d3.select(this.state.xAxisRef).call(this.xAxis);
    d3.select(this.state.yAxisRef).call(this.yAxis);
    d3.select(this.state.yAxisRefNega)
      .transition()
      .duration(2500)
      .call(this.yAxisNega);
    d3.select(this.state.yAxisGridRef).call(this.yAxisGrid);
    d3.select(this.state.yAxisGridRefNega)
      .transition()
      .duration(2500)
      .call(this.yAxisGridNega);
    d3.select(this.state.chartBarsRef)
      .transition()
      .duration(2500);
  }

  render() {
    return (
      <div>
        <svg
          id="vis-container"
          width={this.state.svgWidth}
          height={
            this.state.svgHeight +
            this.state.svgHeightNega -
            defaultSvgScrollHeight
          }
        >
          {this.state.bars.map((d, i) => (
            <rect
              key={i}
              x={d.x + 3}
              y={d.y1}
              width={d.width}
              height={d.height1}
              fill={d.fill1}
            />
          ))}
          {this.state.bars.map((d, i) => (
            <rect
              class="bar"
              key={i}
              x={d.x + d.width + 3}
              y={d.y2}
              width={d.width}
              height={d.height2}
              fill={d.fill2}
            />
          ))}

          {this.state.bars.map((d, i) => (
            <text
              textAnchor="middle"
              x={d.x + d.width / 2}
              y={d.ifnega1 ? d.y1 : d.y1 + d.height1 + 13}
            >
              {d.value1}
            </text>
          ))}

          {this.state.bars.map((d, i) => (
            <text
              textAnchor="middle"
              x={d.x + d.width * 1.5}
              y={d.ifnega2 ? d.y2 : d.y2 + d.height2 + 13}
            >
              {d.value2}
            </text>
          ))}

          {this.state.scrollBars.map((d, i) => (
            <rect
              key={i}
              x={d.scrollX}
              y={d.scrollY1}
              width={d.scrollWidth * 0.95}
              height={d.scrollHeight1}
              fill={d.scrollFill}
            />
          ))}
          {this.state.scrollBars.map((d, i) => (
            <rect
              key={i}
              x={d.scrollX + d.scrollWidth}
              y={d.scrollY2}
              width={d.scrollWidth * 0.95}
              height={d.scrollHeight2}
              fill={d.scrollFill}
            />
          ))}
          <rect
            ref={this.scrollRef}
            className="scroll-selector"
            x={this.state.scrollSelectorX}
            y={0}
            width={this.state.scrollSelectorWidth}
            height={this.state.svgScrollHeight}
          />
          <g>
            <g
              ref={this.xAxisRef}
              transform={`translate(3, ${this.state.svgHeight -
                this.state.svgMargin.bottom -
                this.state.svgScrollHeight -
                this.state.negaHeight})`}
            />
            <g
              ref={this.yAxisRef}
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
            />
            <g
              ref={this.yAxisRefNega}
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
            />
            <g
              ref={this.yAxisGridRef}
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
              opacity={0.1}
            />
            <g
              ref={this.yAxisGridRefNega}
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
              opacity={0.1}
            />
          </g>
        </svg>
      </div>
    );
  }
}

export default BarChart;
