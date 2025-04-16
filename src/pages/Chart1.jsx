import * as React from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  ColumnSeries,
  Category,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-charts";

const SAMPLE_CSS = `
  .control-fluid {
    padding: 0px !important;
  }`;

const Column = () => {
  const [countJibchit, setCountJibchit] = React.useState(0);
  const [countDouer, setCountDouer] = React.useState(0);
  const [countOther, setCountOther] = React.useState(0);

  const addressData = [
    { label: "Douer", count: countDouer },
    { label: "Jebchit", count: countJibchit },
    { label: "Others", count: countOther },
  ];

  React.useEffect(() => {
    const fetchDataJibchit = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/getNumberOfJebchit", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        setCountJibchit(result.count);
      } catch (error) {
        console.log("error", error);
      }
    };

    const fetchDataDouer = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/getNumberOfDouer", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        setCountDouer(result.count);
      } catch (error) {
        console.log("error", error);
      }
    };

    const fetchDataOther = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/getNumberOfOther", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        setCountOther(result.count);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchDataJibchit();
    fetchDataDouer();
    fetchDataOther();
  }, []);

  const axisLabelRender = (args) => {
    const value = parseInt(args.text.replace(/,/g, ""), 10);
    if (value >= 1000) {
      args.text = value / 1000 + "K";
    }
  };

  const tooltipRender = (args) => {
    if (args.text) {
      let value = args.point.y.toLocaleString("en-US");
      args.text = `${args.series.name}: <b>${value}</b>`;
    }
  };

  return (
    <div className="mt-[100px]">
      <div className="control-pane">
        <style>{SAMPLE_CSS}</style>
        <div className="control-section">
          <ChartComponent
            id="charts"
            style={{ textAlign: "center" }}
            primaryXAxis={{
              valueType: "Category",
              interval: 1,
              labelRotation: 0,
              majorGridLines: { width: 0 },
              majorTickLines: { width: 0 },
            }}
            primaryYAxis={{
              title: "Number of Accounts",
              interval: 10,
              majorTickLines: { width: 0 },
              lineStyle: { width: 0 },
            }}
            legendSettings={{
              visible: false,
            }}
            chartArea={{ border: { width: 0 }, margin: { bottom: 12 } }}
            tooltip={{
              enable: true,
              header: "<b>${point.x}</b>",
              format: "${series.name}: <b>${point.y}</b>",
              enableHighlight: true,
            }}
            title="Account Count Comparison by Address"
            axisLabelRender={axisLabelRender.bind(this)}
            tooltipRender={tooltipRender.bind(this)}
          >
            <Inject services={[ColumnSeries, Category, Legend, Tooltip]} />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={addressData}
                xName="label"
                yName="count"
                name="Number of Accounts"
                type="Column"
                cornerRadius={{ topLeft: 4, topRight: 4 }}
                columnSpacing={0.4}
                legendShape="Rectangle"
              />
            </SeriesCollectionDirective>
          </ChartComponent>
        </div>
      </div>
    </div>
  );
};

export default Column;
