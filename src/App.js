import "./App.css";
import { ChromePicker } from "react-color";
import { useState, useEffect, useRef } from "react";
import { ratio as wcagRatio } from "get-contrast";
import { APCAcontrast, sRGBtoY, displayP3toY, calcAPCA } from "apca-w3";
import { colorParsley } from "colorparsley";
import * as d3 from "d3";
import { scaleBand, scaleLinear } from "d3-scale";
import { select, axisLeft } from "d3";

export default function App() {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgBrightness, setFgBrightness] = useState(50);
  const [fgSaturation, setFgSaturation] = useState(50);
  const [contrastModel, setcontrastModel] = useState("WCAG");
  const [dataArray, setDataArray] = useState([]);

  const handleBgColorChange = (newColor) => {
    setBgColor(newColor.hex);
  };
  const handleBrightnessChange = (event) => {
    setFgBrightness(event.target.value);
  };

  const handleSaturationChange = (event) => {
    setFgSaturation(event.target.value);
  };

  const handleSelectModel = (model) => {
    setcontrastModel(model);
  };

  useEffect(() => {
    // Update dataArray whenever bgColor, fgBrightness, fgSaturation, or contrastModel changes
    if (contrastModel === "WCAG") {
      setDataArray(
        wcagContrastRatio({
          backgroundColor: bgColor,
          brightness: fgBrightness,
          saturation: fgSaturation,
        })
      );
    }
    if (contrastModel === "APCA") {
      setDataArray(
        apcaContrastRatio({
          backgroundColor: bgColor,
          brightness: fgBrightness,
          saturation: fgSaturation,
        })
      );
    }
  }, [bgColor, fgBrightness, fgSaturation, contrastModel]);

  return (
    <div className="App">
      <div
        className="Chartview"
        style={{ backgroundColor: bgColor, paddingBottom: "1rem" }}
      >
        <h1 style={{ color: isDarkColor(bgColor) ? "white" : "black" }}>
          ColorToy
        </h1>
        <div className="Chart">
          <Chart
            bgColor={bgColor}
            fgBrightness={fgBrightness}
            fgSaturation={fgSaturation}
            dataArray={dataArray}
            contrastModel={contrastModel}
          />
        </div>
        <TabComponent onSelectModel={handleSelectModel} />
      </div>
      <div className="ColorPickers">
        <div className="Foreground">
          <h2 style={{ textAlign: "center" }}>Foreground Color</h2>
          <ForegroundExamples
            fgBrightness={fgBrightness}
            fgSaturation={fgSaturation}
          />
          <ForegroundColor
            saturation={fgSaturation}
            onSaturationChange={handleSaturationChange}
            brightness={fgBrightness}
            onBrightnessChange={handleBrightnessChange}
          />
        </div>
        <div className="BackgroundPicker">
          <h2 style={{ textAlign: "center" }}>Background Color</h2>
          <div className="DivChromePicker">
            <BgColorPicker bgcolor={bgColor} onChange={handleBgColorChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function isDarkColor(color) {
  if (typeof color === "string" && color.length > 0) {
    const rgb = parseInt(color.slice(1), 16);
    const brightness = (rgb >> 16) & 0xff;
    return brightness < 128;
  }
  return false;
}

function wcagContrastRatio({ backgroundColor, brightness, saturation }) {
  const ratioArray = [];
  for (let hue = 0; hue < 360; hue += 1) {
    const hslColor = `hsl(${hue}, ${saturation}%, ${brightness}%)`;
    const contrast = wcagRatio(backgroundColor, hslColor);
    ratioArray.push({ hue, contrast });
  }
  return ratioArray;
}

function apcaContrastRatio({ backgroundColor, brightness, saturation }) {
  const ratioArray = [];
  for (let hue = 0; hue < 360; hue += 1) {
    const hslColor = `hsl(${hue}, ${saturation}%, ${brightness}%)`;

    const contrast = Math.abs(
      calcAPCA(colorParsley(hslColor), colorParsley(backgroundColor))
    );

    ratioArray.push({ hue, contrast });
  }

  return ratioArray;
}

function TabComponent({ onSelectModel }) {
  const [activeTab, setActiveTab] = useState("WCAG");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onSelectModel(tab);
  };

  return (
    <div className="Tabs">
      <button
        onClick={() => handleTabClick("WCAG")}
        className={`Tab ${activeTab === "WCAG" ? "active" : ""}`}
      >
        WCAG
      </button>
      <button
        onClick={() => handleTabClick("APCA")}
        className={`Tab ${activeTab === "APCA" ? "active" : ""}`}
      >
        APCA
      </button>
    </div>
  );
}

function BgColorPicker({ bgcolor, onChange }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ChromePicker color={bgcolor} onChange={onChange} disableAlpha={true} />
    </div>
  );
}

function ForegroundColor({
  saturation,
  onSaturationChange,
  brightness,
  onBrightnessChange,
}) {
  return (
    <div>
      <div>
        <div>
          <label style={{ marginRight: "1rem" }}>Brightness:</label>
          {brightness}
        </div>
        <input
          className="fgInput"
          type="range"
          min="1"
          max="100"
          value={brightness}
          onChange={onBrightnessChange}
        />
      </div>

      <div>
        <div>
          <label style={{ marginRight: "1rem" }}>Saturation:</label>
          {saturation}
        </div>
        <input
          className="fgInput"
          type="range"
          min="1"
          max="100"
          value={saturation}
          onChange={onSaturationChange}
        />
      </div>
    </div>
  );
}

function ForegroundExamples({ fgSaturation, fgBrightness }) {
  const exampleArray = [
    { alt: "Red", hue: 0 },
    { alt: "Orange", hue: 30 },
    { alt: "Yellow", hue: 60 },
    { alt: "Green", hue: 120 },
    { alt: "Teal", hue: 190 },
    { alt: "Blue", hue: 240 },
    { alt: "Purple", hue: 270 },
    { alt: "Pink", hue: 330 },
    // You can choose any hue for gray, or omit it for a default gray
  ];

  return (
    <div className="colorExamples">
      {exampleArray.map((example) => (
        <ColorExample
          alt={example.alt}
          hue={example.hue}
          saturation={fgSaturation}
          brightness={fgBrightness}
          key={example.hue}
        />
      ))}
    </div>
  );
}

function ColorExample({ alt, hue, saturation, brightness }) {
  const hslColor = `hsl(${hue}, ${saturation}%, ${brightness}%)`;

  return (
    <div
      className="colorExample"
      style={{
        backgroundColor: hslColor,
      }}
      alt={alt}
    ></div>
  );
}

function Chart({
  bgColor,
  fgBrightness,
  fgSaturation,
  dataArray,
  contrastModel,
}) {
  const chartRef = useRef();

  // Use state for variables
  const [yScaleMax, setYScaleMax] = useState(100);
  const [okValue, setOkValue] = useState(3);
  const [goodValue, setGoodValue] = useState(7);

  useEffect(() => {
    // Update variables based on contrastModel
    if (contrastModel === "APCA") {
      setYScaleMax(100);
      setOkValue(45);
      setGoodValue(75);
    } else {
      // Reset values for other contrast models if needed
      setYScaleMax(10);
      setOkValue(3);
      setGoodValue(7);
    }

    const margin = { top: 10, right: 30, bottom: 10, left: 30 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    const svg = select(chartRef.current);

    const tickColor = isDarkColor(bgColor) ? "white" : "black";

    const xScale = scaleBand()
      .domain(dataArray.map(({ hue }) => hue.toString()))
      .range([0, width])
      .padding(0.1);

    const yScale = scaleLinear().domain([0, yScaleMax]).range([height, 0]);

    // Clear existing chart elements
    svg.selectAll("*").remove();

    const bars = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .selectAll(".bar")
      .data(dataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.hue.toString()))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.contrast))
      .attr("height", (d) => height - yScale(d.contrast))
      .attr("fill", (d) => `hsl(${d.hue}, ${fgSaturation}%, ${fgBrightness}%)`);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(
        axisLeft(yScale)
          .ticks(10)
          .tickFormat((d) => d.toFixed(0))
      )
      .selectAll("text")
      .style("fill", tickColor);

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width + margin.left)
      .attr("y1", yScale(okValue) + margin.top)
      .attr("y2", yScale(okValue) + margin.top)
      .attr("stroke", tickColor)
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", 1)
      .style("stroke-dasharray", "3, 3");

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width + margin.left)
      .attr("y1", yScale(goodValue) + margin.top)
      .attr("y2", yScale(goodValue) + margin.top)
      .attr("stroke", tickColor)
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", 1);
  }, [
    bgColor,
    dataArray,
    fgBrightness,
    fgSaturation,
    contrastModel,
    goodValue,
    okValue,
    yScaleMax,
  ]);

  return (
    <svg
      style={{ backgroundColor: bgColor }}
      ref={chartRef}
      width="500"
      height="200"
    ></svg>
  );
}
