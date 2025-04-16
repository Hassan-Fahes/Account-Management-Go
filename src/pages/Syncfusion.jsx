/* eslint-disable no-unused-vars */
import * as React from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  RowDD,
  Inject,
  Sort,
  Toolbar,
  Filter,
  Edit
} from '@syncfusion/ej2-react-grids';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Source() {
  const navigate = useNavigate();
  const { setUser } = React.useContext(AuthContext);

  const [table1Data, setTable1Data] = React.useState([]);
  const [table2Data, setTable2Data] = React.useState([]);

  React.useEffect(() => {
    const getTable1 = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/getAccount", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status === "success") {
          setTable1Data(result.accounts);
        } else if (result.status === "error_token") {
          setUser(null);
          navigate("/");
        }
      } catch (error) {
        console.error("Error in getTable1:", error);
      }
    };

    const getTable2 = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/getOtherAccount", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status === "success") {
          console.log("API result for Table2:", result);
          setTable2Data(result.accounts);
        } else if (result.status === "error_token") {
          setUser(null);
          navigate("/");
        }
      } catch (error) {
        console.error("Error in getTable2:", error);
      }
    };

    getTable1();
    getTable2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let grid1, grid2;
  const filterSettings = { type: 'Excel' };
  const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];
  const editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true };

  const grid1RowDropSettings = { targetID: 'Grid2' };
  const grid2RowDropSettings = { targetID: 'Grid1' };

  const handleRowDrop = (args, targetTable) => {
    console.log("Row drop event on:", targetTable);
    const draggedRecords = args.data;
    console.log("Dragged records:", draggedRecords);

    if (draggedRecords && draggedRecords.length > 0) {
      if (targetTable === "table2") {
        draggedRecords.forEach(record => {
          (async () => {
            const myHeaders = new Headers();
            const token = localStorage.getItem("token");
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);
            const data = {
              account_id: record.id,
              code: record.code,
              name: record.name,
              currency: record.main_currency,
              address: record.address,
              mobile: record.mobile,
            };
            const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: JSON.stringify(data)
            };
            try {
              const response = await fetch("http://localhost:8080/removeFromAccounts", requestOptions);
              const result = await response.json();
              console.log("API result for record:", result);
            } catch (error) {
              console.error("Error in API call:", error);
            }
          })();
        });
        setTable2Data(prev => {
          const newRecords = draggedRecords.filter(record => !prev.find(item => item.id === record.id));
          const newData = [...prev, ...newRecords];
          console.log("New table2Data:", newData);
          setTimeout(() => {
            if (grid2 && grid2.refresh) {
              grid2.refresh();
            }
          }, 0);
          return newData;
        });
        setTable1Data(prev =>
          prev.filter(item => !draggedRecords.find(record => record.id === item.id))
        );
      } else if (targetTable === "table1") {
        draggedRecords.forEach(record => {
          (async () => {
            const myHeaders = new Headers();
            const token = localStorage.getItem("token");
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);
            const data = {
              account_id: record.id,
              code: record.code,
              name: record.name,
              currency: record.main_currency,
              address: record.address,
              mobile: record.mobile,
            };
            const requestOptions = {
              method: "POST",
              headers: myHeaders,
              body: JSON.stringify(data)
            };
            try {
              const response = await fetch("http://localhost:8080/removeFromAccounts_2", requestOptions);
              const result = await response.json();
              console.log("API result for record:", result);
            } catch (error) {
              console.error("Error in API call:", error);
            }
          })();
        });
        setTable1Data(prev => {
          const newRecords = draggedRecords.filter(record => !prev.find(item => item.id === record.id));
          const newData = [...prev, ...newRecords];
          console.log("New table1Data:", newData);
          setTimeout(() => {
            if (grid1 && grid1.refresh) {
              grid1.refresh();
            }
          }, 0);
          return newData;
        });
        setTable2Data(prev =>
          prev.filter(item => !draggedRecords.find(record => record.id === item.id))
        );
      }
    }
  };

  return (
    <div className='mt-[100px]'>
      <div className='control-pane'>
        <div className='control-section'>
          <p>Drag and Drop Rows between Two Different Tables</p>
          <div style={{ display: 'inline-block' }}>
            <div style={{ float: 'left', width: '49%' }}>
              <GridComponent 
                id="Grid1"
                ref={g => { grid1 = g; }}
                dataSource={table1Data}
                allowPaging={true}
                pageSettings={{ pageCount: 1 }}
                allowSorting={true}
                editSettings={editSettings}
                allowFiltering={true}
                filterSettings={filterSettings}
                toolbar={toolbar}
                allowRowDragAndDrop={true}
                rowDropSettings={grid1RowDropSettings}
                selectionSettings={{ type: 'Multiple' }}
                rowDrop={(args) => handleRowDrop(args, "table2")}
              >
                <ColumnsDirective>
                  <ColumnDirective field='id' headerText='ID' width='50' textAlign='Right' isPrimaryKey={true} />
                  <ColumnDirective field='code' headerText='Code' width='100' textAlign='Right'/>
                  <ColumnDirective field='name' headerText='Name' width='150' textAlign='Left'/>
                </ColumnsDirective>
                <Inject services={[Page, RowDD, Sort, Toolbar, Filter, Edit]} />
              </GridComponent>
            </div>
            <div style={{ float: 'right', width: '49%' }}>
              <GridComponent 
                id="Grid2"
                ref={g => { grid2 = g; }}
                dataSource={table2Data}
                height="400px" 
                allowPaging={true}
                pageSettings={{ pageCount: 2 }}
                allowSorting={true}
                editSettings={editSettings}
                allowFiltering={true}
                filterSettings={filterSettings}
                toolbar={toolbar}
                allowRowDragAndDrop={true}
                rowDropSettings={grid2RowDropSettings}
                selectionSettings={{ type: 'Multiple' }}
                rowDrop={(args) => handleRowDrop(args, "table1")}
              >
                <ColumnsDirective>
                  <ColumnDirective field='id' headerText='ID' width='50' textAlign='Right' isPrimaryKey={true} />
                  <ColumnDirective field='code' headerText='Code' width='100' textAlign='Right'/>
                  <ColumnDirective field='name' headerText='Name' width='150' textAlign='Left'/>
                </ColumnsDirective>
                <Inject services={[Page, RowDD, Sort, Toolbar, Filter, Edit]} />
              </GridComponent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Source;
