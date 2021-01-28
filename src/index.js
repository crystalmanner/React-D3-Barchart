import React, { Component } from "react";
import ReactDOM from "react-dom";
import BarChart from "./BarChart";
import * as d3 from "d3";
import "./styles.css";
import sampleData from "./data";

class App extends Component {
  state = {
    dataType: "metric1",
    valueMin: 0,
    valueMax: 0,
    width: 640,
    height: 580
  };

  updateDataType = e => {
    this.setState({ dataType: e.target.value });
  };

  componentDidMount() {
    window.addEventListener("resize", this.redrawChart.bind(this));
  }

  redrawChart() {
    const width = parseInt(d3.select(".Chart").style("width")),
      height = parseInt(d3.select(".Chart").style("height"));

    this.setState(prev => ({
      width,
      height
    }));
  }

  render() {
    const data = sampleData[this.state.dataType];
    const spaceData = { metric1: 0, metric2: 1 };
    const max1 = d3.max(data.map(d => d.info1), d => d.value);
    const max2 = d3.max(data.map(d => d.info2), d => d.value);
    const valueMax =
      (max1 > max2 ? max1 : max2) < 0 ? 0 : max1 > max2 ? max1 : max2;
    const min1 = d3.min(data.map(d => d.info1), d => d.value);
    const min2 = d3.min(data.map(d => d.info2), d => d.value);
    const valueMin =
      (min1 < min2 ? min1 : min2) > 0 ? 0 : min1 < min2 ? min1 : min2;
    const legendName1 = "basecase";
    const legendName2 = "whatif";
    const legendFill1 = "#393939";
    const legendFill2 = "#3182bd";
    // console.log(valueMax);
    // console.log(valueMin);
    // const valueMin = this.state.valueMin;
    // const valueMax = this.state.valueMax;
    // console.log("render:");
    // console.log(this.state.city);

    // console.log(valueMin);
    // const data = this.state.data['portHardy'];
    // const maxNegaVal = this.state.data[this.state.city];
    // console.log(data);

    return (
      <div className="App" id="App">
        <div className="Selector">
          <select name="city" onChange={this.updateDataType}>
            {[
              { label: "Metric1", value: "metric1" },
              { label: "Metric2", value: "metric2" }
            ].map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="Chart">
          <h1>React Scroll Bar Chart</h1>
          <div className="chart-container">
            <BarChart
              data={data}
              dataType={spaceData[this.state.dataType]}
              width={this.state.width}
              height={this.state.height}
              valueMax={valueMax}
              valueMin={valueMin}
              legendName1={legendName1}
              legendName2={legendName2}
              legendFill1={legendFill1}
              legendFill2={legendFill2}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
