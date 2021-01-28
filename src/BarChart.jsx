import React, { Component } from "react";
import * as d3 from "d3";

import "./BarChart.css";

// ***** Default svg data
const defaultSvgWidth = 640;
const defaultSvgHeight = 580;
const defaultSvgHeightNega = 0;
const defaultSvgMargin = { top: 30, right: 5, bottom: 60, left: 35 };
const defaultSvgScrollHeight = 60;
const defaultPadding = 0.2;
const defaultSliceWidth = 5;
const defaultPaddingWidth = 0;
const defaultLabelSpace = 1;
// defaultPaddingWidth: space width between Title and Chart.
class BarChart extends Component {
  constructor(props) {
    super(props);
    d3.select(window).on("resize", this.resize);
    // const propsWidth = document.getElementById("App").style.width - defaultSvgMargin.left - defaultSvgMargin.right;
    // const propsheight = document.getElementById("App").style.height - defaultSvgMargin.top - defaultSvgMargin.bottom;
    // const svgWidth = props.width === undefined ? defaultSvgWidth : props.width;
    const svgWidth = window.innerWidth - 192;
    const svgHeight =
      props.height === undefined ? defaultSvgHeight : props.height;
    // const svgWidth = propsWidth;
    // const svgHeight = propsheight;
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
    //if chart draw negative vaule, negavtive y-axis has to be expanded for drawing number.
    //if not, chart number will hide x-axis.
    //expanding y-axis value is defaultNegaAxisExt;
    const defaultNegaAxisExt = props.valueMax / 20;
    //const defaultNegaAxisExt = props.valueMax === undefined ? props.valueMax / 20 : 6;
    const defaultPosiAxisExt = props.valueMax / 20;
    //const defaultPosiAxisExt = props.valueMax === undefined ? props.valueMax / 20 : 6;
    //if chart draw negative vaule, negavtive y-axis has to be expanded for drawing number.
    //temp1 is used to calulate expanding y-axis scale value;
    const temp =
      svgHeight -
      svgMargin.bottom -
      svgScrollHeight * 2 -
      (svgMargin.top + defaultPaddingWidth);
    const temp1 =
      props.valueMax != 0
        ? temp *
          (1 +
            (props.valueMin -
              (props.valueMax != 0 && props.valueMin != 0
                ? defaultNegaAxisExt
                : 0)) /
              (props.valueMax + defaultPosiAxisExt))
        : 0;

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
      // if chart has only positive or negative, it is not needed to expanding negative y-axis.
      negaAxisExt:
        props.valueMax != 0 && props.valueMin != 0 ? defaultNegaAxisExt : 0,

      // positive chart height
      positveWidth:
        props.valueMax != 0
          ? 0
          : svgHeight -
            svgMargin.bottom -
            svgScrollHeight * 2 -
            svgMargin.top -
            defaultPaddingWidth,
      // x-Axis scale
      xScale: d3
        .scaleBand()
        .range([svgMargin.left, svgWidth - svgMargin.right])
        .padding(padding),
      // y-Axis scale
      yScaleAxis: d3
        .scaleLinear()
        .range([
          svgHeight - svgMargin.bottom - svgScrollHeight * 2,
          svgMargin.top + defaultPaddingWidth
        ]),
      // y-Axis negative scale
      yScaleAxisGridNega: d3
        .scaleLinear()
        .range([
          svgHeight - svgMargin.bottom - svgScrollHeight * 2,
          svgMargin.top + defaultPaddingWidth
        ]),
      yScaleAxisNega:
        props.valueMax != 0
          ? d3
              .scaleLinear()
              .range([
                svgHeight -
                  svgMargin.bottom -
                  svgScrollHeight * 2 -
                  defaultPaddingWidth +
                  svgHeight -
                  svgScrollHeight * 2 -
                  svgMargin.top -
                  svgMargin.bottom -
                  temp1,
                svgMargin.top +
                  svgScrollHeight +
                  svgHeight -
                  svgScrollHeight * 3 -
                  svgMargin.top -
                  svgMargin.bottom
              ])
          : d3
              .scaleLinear()
              .range([
                svgHeight - svgMargin.bottom - svgScrollHeight * 2,
                svgMargin.top + defaultPaddingWidth
              ]),

      // negative chart height
      negaHeight:
        this.props.valueMax != 0
          ? (temp *
              (this.props.valueMin -
                (this.props.valueMax != 0 && props.valueMin != 0
                  ? defaultNegaAxisExt
                  : 0))) /
            (this.props.valueMax + defaultPosiAxisExt)
          : -temp,
      posiAxisExt: defaultPosiAxisExt,
      xAxisRef: null,
      yAxisRef: null,
      yAxisRefNega: null,
      yAxisGridRef: null,
      yAxisGridRefNega: null,
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

    const yAxisRange = Math.abs(
      svgHeight -
        svgMargin.bottom -
        svgScrollHeight * 2 -
        (svgMargin.top + defaultPaddingWidth)
    );
    const yAxisNegaRange =
      props.valueMax != 0
        ? Math.abs(
            svgHeight -
              svgMargin.bottom -
              svgScrollHeight * 2 -
              defaultPaddingWidth +
              svgHeight -
              svgScrollHeight * 2 -
              svgMargin.top -
              svgMargin.bottom -
              temp1 -
              (svgMargin.top +
                svgScrollHeight +
                svgHeight -
                svgScrollHeight * 3 -
                svgMargin.top -
                svgMargin.bottom)
          )
        : Math.abs(
            svgHeight -
              svgMargin.bottom -
              svgScrollHeight * 2 -
              (svgMargin.top + defaultPaddingWidth)
          );

    const tickScale = Math.max(yAxisRange, yAxisNegaRange);
    const tickRange = tickScale / 10;
    const positiveTicks = yAxisRange / tickRange;
    const negativeTicks = yAxisNegaRange / tickRange;

    this.xAxis =
      props.valueMax != 0
        ? d3.axisBottom().scale(this.state.xScale)
        : d3.axisTop().scale(this.state.xScale);
    this.yAxis = d3
      .axisLeft()
      .scale(this.state.yScaleAxis)
      .ticks(positiveTicks)
      .tickFormat(d => `${this.formatDataLabel(d)}`);
    this.yAxisNega = d3
      .axisLeft()
      .scale(this.state.yScaleAxisNega)
      .ticks(negativeTicks)
      .tickFormat(
        d => `${props.valueMax == 0 || d != 0 ? this.formatDataLabel(d) : ""}`
      );
    this.yAxisGrid = d3
      .axisLeft(this.state.yScaleAxis)
      .ticks(positiveTicks)
      .tickSize(-this.state.svgWidth + 40)
      .tickFormat("");
    this.yAxisGridNega = d3
      .axisLeft(this.state.yScaleAxisNega)
      .ticks(negativeTicks)
      .tickSize(-this.state.svgWidth + 40)
      .tickFormat("");
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

  yAxisGridRef = element => {
    this.setState({ yAxisGridRef: element });
    d3.select(element).call(this.yAxisGrid);
  };

  yAxisGridRefNega = element => {
    this.setState({ yAxisGridRefNega: element });

    d3.select(element).call(this.yAxisGridNega);
  };

  resize = event => {
    const svgWidth = document.getElementById("App").offsetWidth - 160;
    const padding =
      this.props.padding === undefined ? defaultPadding : this.props.padding;
    this.setState(
      {
        svgWidth,
        xScale: d3
          .scaleBand()
          .range([
            this.state.svgMargin.left,
            svgWidth - this.state.svgMargin.right
          ])
          .padding(padding),
        xScrollScale: d3
          .scaleBand()
          .range([
            this.state.svgScrollMargin.left,
            svgWidth - this.state.svgScrollMargin.right
          ])
          .padding(padding)
      },
      () => {
        const bars = this.calculateBars();
        const scrollBars = this.calculateScrollBars();
        const selector = this.calculateScrolSellector(scrollBars.length);
        const states = { ...selector, bars, scrollBars };
        this.state = { ...this.state, ...states };
      }
    );
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
    // console.log(this.state.scrollSelectorX);
    if (newSlice !== oldSlice) {
      const bars = this.calculateBars(newSlice);
      this.setState({ scrollSelectorX: newX, sliceStart: newSlice, bars });
    } else {
      this.setState({ scrollSelectorX: newX });
    }
  };

  formatDataLabel = val => {
    let res = val >= 0 ? "$" + val : "-$" + -val;
    if (Math.abs(val) >= 1000000) {
      if (val > 0) {
        res = "$" + val / 1000000 + "M";
      } else {
        res = "-$" + -val / 1000000 + "M";
      }
    }
    return res;
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
      .map(d => d.label + " ".repeat(this.props.dataType));
    const labelDomain2 = data
      .map(d => d.info2)
      .slice(sliceStart, sliceStart + sliceWidth)
      .map(d => d.label + " ".repeat(this.props.dataType));
    const max1 = d3.max(data.map(d => d.info1), d => d.value);
    const max2 = d3.max(data.map(d => d.info2), d => d.value);
    const valueMax =
      (max1 > max2 ? max1 : max2) < 0 ? 0 : max1 > max2 ? max1 : max2;
    const min1 = d3.min(data.map(d => d.info1), d => d.value);
    const min2 = d3.min(data.map(d => d.info2), d => d.value);
    const valueMin =
      (min1 < min2 ? min1 : min2) > 0 ? 0 : min1 < min2 ? min1 : min2;

    xScale.domain(labelDomain1 < labelDomain2 ? labelDomain1 : labelDomain2);
    // calulation positive y-Axis scale
    // console.log(valueMin);
    if (valueMax != 0) {
      yScaleAxis.domain([0, valueMax + this.state.posiAxisExt]);
    } else {
      yScaleAxis.domain([0, -valueMin]);
    }
    // calulation negative y-Axis scale
    if (valueMin != 0) {
      if (valueMax != 0) {
        yScaleAxisNega.domain([valueMin - this.state.negaAxisExt, 0]);
      } else {
        // console.log(this.state.negaAxisExt);
        yScaleAxisNega.domain([valueMin + this.state.negaAxisExt, 0]);
      }
    } else {
      yScaleAxisNega.domain([valueMin, 0]);
    }
    const bars = data
      .slice(sliceStart, sliceStart + sliceWidth)
      .map((d, index) => {
        const x = xScale(d.info1.label + " ".repeat(this.props.dataType));
        const ifnega1 = d.info1.value < 0 ? false : true;
        const ifnega2 = d.info2.value < 0 ? false : true;
        const zeroLavelPos1 = valueMax == 0 ? -23 : 0;
        const zeroLavelPos2 = valueMax == 0 ? -23 : 0;
        const y1 = ifnega1
          ? yScaleAxis(d.info1.value + zeroLavelPos1) - this.state.positveWidth
          : yScaleAxis(0) - this.state.positveWidth;
        const y2 = ifnega2
          ? yScaleAxis(d.info2.value + zeroLavelPos2) - this.state.positveWidth
          : yScaleAxis(0) - this.state.positveWidth;
        const width = xScale.bandwidth() / 2;
        const height1 = ifnega1
          ? yScaleAxis(0) - yScaleAxis(d.info1.value)
          : yScaleAxisNega(0) - yScaleAxisNega(Math.abs(d.info1.value));
        const height2 = ifnega2
          ? yScaleAxis(0) - yScaleAxis(d.info2.value)
          : yScaleAxisNega(0) - yScaleAxisNega(Math.abs(d.info2.value));

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
    const scrolllabelDomain1 = data.map(
      d => d.info1.label + " ".repeat(this.props.dataType)
    );
    const scrolllabelDomain2 = data.map(
      d => d.info2.label + " ".repeat(this.props.dataType)
    );
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
        const scrollX = xScrollScale(
          d.info1.label + " ".repeat(this.props.dataType)
        );
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

  calculateChart = (type = "change") => {
    const bars = this.calculateBars();
    const scrollBars = this.calculateScrollBars();
    const selector = this.calculateScrolSellector(scrollBars.length);
    const states = { ...selector, bars, scrollBars };
    // implement transition of chart
    this.setState({ ...states }, () => {
      bars.map((d, i) => {
        if (d.value1 < 0) {
          d3.selectAll(".upBar" + i).attr("height", 0);

          d3.selectAll(".upBar" + i)
            .transition()
            .attr("height", d.height1)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
          //text
          d3.selectAll("#text1Var" + i)
            .attr("y", d.y1 + 15) // +15: when valueMax is 0, increase label position
            .attr("height", 0);

          d3.selectAll("#text1Var" + i)
            .transition()
            .attr("y", d.y1 + d.height1 + 14 + defaultLabelSpace)
            .attr("height", d.height1)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
        } else {
          d3.selectAll(".upBar" + i)
            .attr("y", d.y1 + d.height1)
            .attr("height", 0);

          d3.selectAll(".upBar" + i)
            .transition()
            .attr("y", d.y1)
            .attr("height", d.height1)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
          //text
          d3.selectAll("#text1Var" + i)
            .attr("y", d.y1 + d.height1)
            .attr("height", 0);

          d3.selectAll("#text1Var" + i)
            .transition()
            .attr("y", d.y1 - defaultLabelSpace)
            .attr("height", d.height1)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
        }
        if (d.value2 < 0) {
          d3.selectAll(".downBar" + i).attr("height", 0);

          d3.selectAll(".downBar" + i)
            .transition()
            .attr("height", d.height2)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);

          //text
          d3.selectAll("#text2Var" + i)
            .attr("y", d.y2 + 15) // +15: when valueMax is 0, increase label position
            .attr("height", 0);

          d3.selectAll("#text2Var" + i)
            .transition()
            .attr("y", d.y2 + d.height2 + 13 + defaultLabelSpace)
            .attr("height", d.height2)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
        } else {
          d3.selectAll(".downBar" + i)
            .attr("y", d.y2 + d.height2)
            .attr("height", 0);

          d3.selectAll(".downBar" + i)
            .transition()
            .attr("y", d.y2)
            .attr("height", d.height2)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
          //text
          d3.selectAll("#text2Var" + i)
            .attr("y", d.y2 + d.height2)
            .attr("height", 0);

          d3.selectAll("#text2Var" + i)
            .transition()
            .attr("y", d.y2 - defaultLabelSpace)
            .attr("height", d.height2)
            .delay(type === "change" && this.props.valueMin != 0 ? 850 : 0)
            .duration(type === "change" ? 1000 : 0);
        }
        // d3.selectAll("#text1Var"+i)
        //   .transition()
        //   .attr("text-color", "red").delay(2000)
        //   .duration(2000);
      });
    });
  };

  // componentWillReceiveProps() {
  //   d3.selectAll(".bar")
  //     .transition()
  //     .style("fill", "white");
  // }

  componentDidUpdate(props, state) {
    if (
      props.data !== this.props.data ||
      state.svgWidth !== this.state.svgWidth
    ) {
      // when selete combobox, display first chart data.
      this.state.sliceStart = 0;
      this.state.scrollSelectorX = this.state.svgScrollMargin.left;

      // this.state.negaAxisExt =
      //   this.props.valueMax != 0 && this.props.valueMin != 0
      //     ? this.props.valueMax
      //     : 0;
      this.state.posiAxisExt = this.props.valueMax / 20;
      this.state.negaAxisExt =
        this.props.valueMax != 0 && this.props.valueMin != 0
          ? this.props.valueMax / 20
          : 0;

      if (this.props.valueMax == 0 && this.props.valueMin != 0) {
        this.state.negaAxisExt = this.props.valueMin / 20;
      }
      this.state.positveWidth =
        this.props.valueMax != 0
          ? 0
          : this.state.svgHeight -
            this.state.svgMargin.bottom -
            this.state.svgScrollHeight * 2 -
            this.state.svgMargin.top -
            defaultPaddingWidth;

      const temp =
        this.state.svgHeight -
        this.state.svgMargin.bottom -
        this.state.svgScrollHeight -
        (this.state.svgMargin.top +
          this.state.svgScrollHeight +
          defaultPaddingWidth);

      const temp1 =
        this.props.valueMax != 0
          ? temp *
            (1 +
              (this.props.valueMin - this.state.negaAxisExt) /
                (this.props.valueMax + this.state.negaAxisExt))
          : 0;

      this.state.yScaleAxisNega =
        this.props.valueMax != 0
          ? d3
              .scaleLinear()
              .range([
                this.state.svgHeight -
                  this.state.svgMargin.bottom -
                  defaultPaddingWidth +
                  this.state.svgHeight -
                  this.state.svgScrollHeight * 4 -
                  this.state.svgMargin.top -
                  this.state.svgMargin.bottom -
                  temp1,
                this.state.svgMargin.top +
                  this.state.svgHeight -
                  this.state.svgScrollHeight * 2 -
                  this.state.svgMargin.top -
                  this.state.svgMargin.bottom
              ])
          : d3
              .scaleLinear()
              .range([
                this.state.svgHeight -
                  this.state.svgMargin.bottom -
                  this.state.svgScrollHeight * 2,
                this.state.svgMargin.top + defaultPaddingWidth
              ]);

      const yAxisRange = Math.abs(
        this.state.svgHeight -
          this.state.svgMargin.bottom -
          this.state.svgScrollHeight * 2 -
          (this.state.svgMargin.top + defaultPaddingWidth)
      );
      const yAxisNegaRange =
        this.props.valueMax != 0
          ? Math.abs(
              this.state.svgHeight -
                this.state.svgMargin.bottom -
                defaultPaddingWidth +
                this.state.svgHeight -
                this.state.svgScrollHeight * 4 -
                this.state.svgMargin.top -
                this.state.svgMargin.bottom -
                temp1 -
                (this.state.svgMargin.top +
                  this.state.svgHeight -
                  this.state.svgScrollHeight * 2 -
                  this.state.svgMargin.top -
                  this.state.svgMargin.bottom)
            )
          : Math.abs(
              this.state.svgHeight -
                this.state.svgMargin.bottom -
                this.state.svgScrollHeight * 2 -
                (this.state.svgMargin.top + defaultPaddingWidth)
            );

      // console.log("yAxisRange", yAxisRange);
      // console.log("yAxisNegaRange", yAxisNegaRange);

      const tickScale = yAxisRange;
      const tickRange = tickScale / 10;
      const positiveTicks = yAxisRange / tickRange;
      const negativeTicks = yAxisNegaRange / tickRange;
      this.yAxis = d3
        .axisLeft()
        .scale(this.state.yScaleAxis)
        .ticks(positiveTicks)
        .tickFormat(d => `${this.formatDataLabel(d)}`);
      this.yAxisGrid = d3
        .axisLeft(this.state.yScaleAxis)
        .tickSize(-this.state.svgWidth + 40)
        .ticks(positiveTicks)
        .tickFormat("");

      this.yAxisGridNega = d3
        .axisLeft(this.state.yScaleAxisNega)
        .ticks(negativeTicks)
        .tickSize(-this.state.svgWidth + 40)
        .tickFormat("");
      this.yAxisNega = d3
        .axisLeft()
        .scale(this.state.yScaleAxisNega)
        .ticks(negativeTicks)
        .tickFormat(
          d => `${props.valueMax != 0 || d != 0 ? this.formatDataLabel(d) : ""}`
        );
      // this.xAis = null;
      // console.log("yScaleAxisNega", this.yAxisNega);

      // this.xAxis =
      //   this.props.valueMax != 0
      //     ? d3.axisBottom().scale(this.state.xScale)
      //     : d3.axisTop().scale(this.state.xScale);
      // d3.select(this.state.xAxisRef).call(this.xAxis);

      if (state.svgWidth !== this.state.svgWidth) {
        this.calculateChart("resize");
      } else {
        this.calculateChart();
      }

      this.state.negaHeight =
        this.props.valueMax != 0
          ? (temp * (this.props.valueMin - this.state.negaAxisExt)) /
            (this.props.valueMax + this.state.negaAxisExt)
          : -temp;

      d3.select(this.state.yAxisRef).call(this.yAxis);
      // implement y-axis and y-axis grid transition
      if (this.props.valueMin != 0) {
        d3.select(this.state.yAxisRefNega)
          .transition()
          // .duration(800)
          .call(this.yAxisNega);
        d3.select(this.state.yAxisGridRefNega)
          .transition()
          // .duration(800)
          .call(this.yAxisGridNega);
      } else {
        d3.select(this.state.yAxisRefNega).call(this.yAxisNega);
        d3.select(this.state.yAxisGridRefNega).call(this.yAxisGridNega);
      }
      d3.select(this.state.yAxisGridRef).call(this.yAxisGrid);
    }
    // console.log(this.props.valueMax);
    this.xAxis =
      this.props.valueMax != 0
        ? d3.axisBottom().scale(this.state.xScale)
        : d3.axisTop().scale(this.state.xScale);
    d3.select(this.state.xAxisRef).call(this.xAxis);
  }

  render() {
    return (
      <div>
        <svg
          id="vis-container"
          width={this.state.svgWidth + 160}
          height={
            this.state.svgHeight -
            this.state.negaHeight -
            this.state.svgScrollHeight -
            this.state.positveWidth
          }
        >
          <rect
            fill={this.props.legendFill1}
            width="15"
            height="15"
            x={this.state.svgWidth + 50}
            y={this.state.svgMargin.top - defaultPaddingWidth - 5}
          />
          <text
            // textAnchor="middle"
            x={this.state.svgWidth + 70}
            y={this.state.svgMargin.top - defaultPaddingWidth + 9}
          >
            {this.props.legendName1}
          </text>
          <rect
            fill={this.props.legendFill2}
            width="15"
            height="15"
            x={this.state.svgWidth + 50}
            y={this.state.svgMargin.top - defaultPaddingWidth + 15}
          />
          <text
            // textAnchor="middle"
            x={this.state.svgWidth + 70}
            y={this.state.svgMargin.top - defaultPaddingWidth + 29}
          >
            {this.props.legendName2}
          </text>
          {this.state.bars.map((d, i) => (
            <rect
              className={"upBar" + i}
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
              className={"downBar" + i}
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
              key={i}
              id={"text1Var" + i}
              textAnchor="middle"
              x={d.x + d.width / 2}
              y={
                d.ifnega1
                  ? d.y1 - defaultLabelSpace
                  : d.y1 + d.height1 + 13 + defaultLabelSpace
              }
            >
              {this.formatDataLabel(d.value1)}
            </text>
          ))}

          {this.state.bars.map((d, i) => (
            <text
              key={i}
              id={"text2Var" + i}
              textAnchor="middle"
              x={d.x + d.width * 1.5}
              y={
                d.ifnega2
                  ? d.y2 - defaultLabelSpace
                  : d.y2 + d.height2 + 13 + defaultLabelSpace
              }
            >
              {this.formatDataLabel(d.value2)}
            </text>
          ))}

          {this.state.scrollBars.map((d, i) => (
            <rect
              key={i}
              x={d.scrollX}
              y={
                d.scrollY1 +
                this.state.svgHeight -
                this.state.negaHeight -
                this.state.svgScrollHeight * 2 -
                this.state.positveWidth
              }
              width={d.scrollWidth * 0.95} // *0.95: scroll chart space
              height={d.scrollHeight1}
              fill={d.scrollFill}
            />
          ))}
          {this.state.scrollBars.map((d, i) => (
            <rect
              key={i}
              x={d.scrollX + d.scrollWidth}
              y={
                d.scrollY2 +
                this.state.svgHeight -
                this.state.negaHeight -
                this.state.svgScrollHeight * 2 -
                this.state.positveWidth
              }
              width={d.scrollWidth * 0.95} // *0.95: scroll chart space
              height={d.scrollHeight2}
              fill={d.scrollFill}
            />
          ))}
          <rect
            ref={this.scrollRef}
            className="scroll-selector"
            x={this.state.scrollSelectorX}
            y={
              this.state.svgHeight -
              this.state.negaHeight -
              this.state.svgScrollHeight * 2 -
              this.state.positveWidth
            }
            width={this.state.scrollSelectorWidth}
            height={this.state.svgScrollHeight}
          />
          <g>
            {this.props.valueMax != 0 ? (
              <g
                ref={this.xAxisRef}
                transform={`translate(3, ${this.state.svgHeight -
                  this.state.svgMargin.bottom -
                  this.state.svgScrollHeight * 2 -
                  this.state.negaHeight})`}
              />
            ) : (
              <g
                ref={this.xAxisRef}
                transform={`translate(5, ${this.state.svgMargin.top +
                  defaultPaddingWidth})`}
              />
            )}

            <g
              ref={this.yAxisRef}
              id="y-axis"
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
              opacity={this.props.valueMax != 0 ? 1 : 0}
            />
            <g
              ref={this.yAxisRefNega}
              id="y-negaAxis"
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
            />

            <g
              ref={this.yAxisGridRef}
              id="y-grid"
              transform={`translate(${this.state.svgMargin.left + 3}, 0)`}
              opacity={this.props.valueMax != 0 ? 0.1 : 0}
            />

            <g
              ref={this.yAxisGridRefNega}
              id="y-grid-nega"
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
