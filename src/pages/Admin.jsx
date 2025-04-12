import { useContext, useEffect, useState } from "react";
import { Accounts, Footer, NavBar , Table } from "../components";
import table from '../Data/TableData'
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [pageSize , setPageSize] = useState(10) ;
  const [columnVisibility, setColumnVisibility] = useState({});
  const [data , setData] = useState([]) ;
  const {setUser} = useContext(AuthContext) ;
  const navigate = useNavigate() ;
 useEffect(() => {
    const getAccounts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8080/getAccount" ,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        if (result.status === "success") {
          setData(result.accounts);
        }else if(result.status === "error_token"){
          setUser(null) ;
          navigate("/") ;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    getAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
        <NavBar/>
        <Accounts setData={setData} columns={table.columns} setPageSize={setPageSize} data={data} setFilterType={setFilterType} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility}/>
        <Table data={data} setData={setData} columns={table.columns} pageSize={pageSize} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} filterType={filterType} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility}/>
        <Footer/>
    </div>
  )
}

export default Admin
