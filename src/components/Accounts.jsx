// /* eslint-disable react/prop-types */
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useContext, useState } from "react";
import { FaFilter } from "react-icons/fa6"
import { IoMdArrowDropdown } from "react-icons/io"
import { PiPrinter } from "react-icons/pi"
import { jsPDF } from "jspdf"; 
import * as XLSX from 'xlsx';
import { IoNewspaperSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Accounts({ globalFilter, setData , setGlobalFilter , setFilterType , setPageSize , data , columns ,columnVisibility, setColumnVisibility}) {
  const [showFilter, setShowFilter] = useState(true);
  const [result , setResult] = useState("Show 10 result");
  const[success , setSuccess] = useState("") ;
  const [inputValue , setInputValue] = useState({code : "" , name : "" , currency : "USD" , address : "" , mobile : ""});
  const [errors , setErrors] = useState({errorCode : "" , errorName : "" , errorCurrency : "" , errorAddress : "" , errorMobile : ""});
  const navigate = useNavigate() ;
  const {setUser} = useContext(AuthContext) ;

  // function To add a account
  const addAccount = async () => {
    // Header
    const myHeaders = new Headers() ;
    const token = localStorage.getItem("token") ;
    myHeaders.append("Content-Type" , "application/json") ;
    myHeaders.append("Authorization" ,`Bearer ${token}` )
    // Body
    const data = {
      code: inputValue.code,
      name: inputValue.name,
      currency: inputValue.currency,
      address: inputValue.address,
      mobile: inputValue.mobile,
    };

    const requestOptions = {
      method : "POST" ,
      headers : myHeaders ,
      body : JSON.stringify(data)
    }

    await fetch("http://localhost:8080/addAccount" , requestOptions)
    .then(response => response.json())
    .then(result => getResultAddAccout(result))
    .catch(error => console.error("Error:", error));

    function getResultAddAccout(result) {

      if (result.status === "error" && result.message === "Code already exists for another account") {
        setErrors({
          errorCode: "Code already exists",
          errorMobile: "",
          errorName: "",
          errorAddress: "",
          errorCurrency: ""
        });
        setSuccess("");
      } else if (result.status === "error") {
        setErrors({
          errorCode: result.errors?.code || "",
          errorName: result.errors?.name || "",
          errorAddress: result.errors?.address || "",
          errorCurrency: result.errors?.currency || "",
          errorMobile: result.errors?.mobile || ""
        });
      } else if (result.status === "error_token") {
        setUser(null);
        navigate("/");
      } else {
        // حالة النجاح
        setErrors({
          errorCode: "",
          errorName: "",
          errorAddress: "",
          errorCurrency: "",
          errorMobile: ""
        });
        setInputValue({
          code: "",
          name: "",
          currency: "USD",
          address: "",
          mobile: ""
        });
        setSuccess(result.message);
        
        // تأكد أن result.id موجود وإلا ستحتاج لعمل معالجة مناسبة
        setData(prev => [...prev, {
          id: result.id, 
          code: inputValue.code,
          name: inputValue.name,
          address: inputValue.address,
          main_currency: inputValue.currency,
          mobile: inputValue.mobile
        }]);
      }
    }
    
  }

  const tempTable = useReactTable({
    data: [],
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  function hiddenFilter(){
    setShowFilter(!showFilter);
  }
 // Convert To Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    XLSX.writeFile(wb, "accounts.xlsx");
  };

  // Convert To CVC
  const exportToCSV = () => {
    const headers = columns.map(col => col.header).join(",");
    const rows = data.map(row => columns.map(col => row[col.accessorKey]).join(","));
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "accounts.csv";
    link.click();
  }

  // Convert To PDF 
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Accounts List", 14, 22);

    let y = 30;
    doc.setFontSize(12);
    columns.forEach((col, index) => {
      doc.text(col.header, 14 + (index * 40), y);
    });

    data.forEach((row) => {
      y += 10;
      columns.forEach((col, colIndex) => {
        doc.text(row[col.accessorKey]?.toString() || '', 14 + (colIndex * 40), y);
      });
    });

    doc.save("accounts.pdf");
  }

  // Print
  const printData = () => {
    console.log(data) ;
    let printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Print Accounts</title></head><body>");
    printWindow.document.write("<h2>Accounts List</h2>");
  
    let tableHtml = "<table border='1' style='width: 100%; border-collapse: collapse;'>";
    tableHtml += "<tr>";
    // استخدم optional chaining للتأكد من أن columns معرف
    columns?.forEach((col) => {
      tableHtml += `<th style='padding: 5px;'>${col.header}</th>`;
    });
    tableHtml += "</tr>";
  
    // تأكد من أن data معرف قبل تكراره
    data?.forEach((row) => {
      tableHtml += "<tr>";
      columns?.forEach((col) => {
        tableHtml += `<td style='padding: 5px;'>${row[col.accessorKey]}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</table>";
    printWindow.document.write(tableHtml);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };
  

  return (
    <div>
      <div className="flex justify-center">
        <div className="container mt-3">
          <div className="flex justify-between">
            <p className="pl-2 text-blue-900 text-lg font-bold">Accounts</p>
            <div className="flex gap-2 pr-1">
              <button onClick={hiddenFilter} className="btn flex font-bold border-blue-900 border-r text-sm border-t border-b py-1 border-l items-center gap-1 bg-white text-blue-900 px-3 rounded-md"><span><FaFilter /></span>filter</button>
              <button className="btn flex font-bold items-center bg-blue-900 text-white px-3 text-sm py-1 rounded-md" onClick={()=>document.getElementById('my_modal_2').showModal()}>New Account</button>
              <dialog id="my_modal_2" className="modal">
                <div className="modal-box sm:max-w-[70%] max-w-[90%]">
                  <div className="flex items-center gap-3 h-[50px] pl-5 border-b">
                    <span className="rounded-full w-7 flex justify-center items-center h-7 bg-blue-200"><IoNewspaperSharp /></span>
                    <p className="font-bold">New Account</p>
                  </div>
                  <form className="my-4 border-b " action="">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex gap-3">
                        <label className="text-sm text-gray-500" htmlFor="code">Code:</label><span className="font-bold text-sm text-red-600">{errors.errorCode}</span>
                      </div>
                      <input value={inputValue.code} placeholder="401888888" onChange={(e) => setInputValue({...inputValue , code :e.target.value})} className="w-full border p-2 h-8" type="number" id="code" />
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-3">
                      <label className="text-sm text-gray-500" htmlFor="name">Name:</label><span className="font-bold text-sm text-red-600">{errors.errorName}</span>
                      <input value={inputValue.name} placeholder="Hassan" onChange={(e) => setInputValue({...inputValue , name : e.target.value})} className="w-full border p-2 h-8" type="text" id="name" />
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-3">
                      <label className="text-sm text-gray-500" htmlFor="currency">Main Currency</label><span className="font-bold text-sm text-red-600">{errors.errorCurrency}</span>
                      <select onChange={(e) => setInputValue({...inputValue , currency : e.target.value})} className="w-full h-fit border p-2" type="text" id="currency">
                        <option value="USD">USD</option>
                        <option value="LBP">LBP</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-3">
                      <label className="text-sm text-gray-500" htmlFor="address">Address:</label><span className="font-bold text-sm text-red-600">{errors.errorAddress}</span>
                      <input value={inputValue.address} placeholder="Jibchit" onChange={(e) => setInputValue({...inputValue , address:e.target.value})} className="w-full border p-2 h-8" type="text" id="address" />
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-3">
                      <label className="text-sm text-gray-500" htmlFor="mobile">Mobile:</label><span className="font-bold text-sm text-red-600">{errors.errorMobile}</span>
                      <input value={inputValue.mobile} placeholder="81872206" onChange={(e) => setInputValue({...inputValue , mobile:e.target.value})} className="w-full border p-2 h-8" type="phone" id="mobile" />
                    </div>
                  </form>
                  <div className=" flex justify-between items-center">
                    <p className="text-sm text-green-500 font-bold">{success}</p>
                    <div className="flex justify-end gap-2 mt-3 mb-4">
                        <form method="dialog">
                          {/* if there is a button in form, it will close the modal */}
                          <button className="btn rounded-md h-8 transition-all duration-300 bg-white hover:bg-blue-900 text-blue-900 hover:text-white">Close</button>
                        </form>
                        <button onClick={addAccount} className="btn rounded-md h-8 transition-all duration-300 bg-blue-900 hover:bg-white text-white hover:text-blue-900">Create</button>
                    </div>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
          <div
            className={`transition-all duration-500 overflow-hidden ${showFilter ? "max-h-[100px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"}`}
          >
            <form id="filtration" className="flex pl-3 rounded-md mt-5 gap-9 h-[60px] items-center bg-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">ALL</span>
                <input name="filter" onClick={() => setFilterType("all")} className="mt-0.5" type="radio" id="all" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">SUPPLIER</span>
                <input name="filter" onClick={() => setFilterType("supplier")} className="mt-0.5" type="radio" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">CUSTOMER</span>
                <input name="filter" onClick={() => setFilterType("customer")} className="mt-0.5" type="radio" />
              </div>
            </form>
          </div>
          <div className="flex gap-3 md:flex-row flex-col justify-between items-center mt-2">
            <div className="flex gap-2">
              <div className="flex sm:flex-row flex-col gap-2">
                <button onClick={printData} className="flex items-center gap-1 border px-3 py-1 h-[41px] mb-2 text-sm border-blue-500 rounded-md"><span className=" text-green-400"><PiPrinter /></span>Print</button>
                <div className="dropdown dropdown-start">
                  <div tabIndex={0} role="button" className="btn flex items-center gap-1 border px-3 py-1 text-sm bg-white border-blue-500 rounded-md">Export <span><IoMdArrowDropdown /></span></div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li onClick={exportToCSV}><a>CVC</a></li>
                    <li onClick={exportToPDF}><a>PDF</a></li>
                    <li onClick={exportToExcel}><a>Excel</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex sm:flex-row flex-col gap-2">
                <div className="flex justify-end mb-2">
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn border px-3 py-1 text-sm border-blue-500 rounded-md">
                      Column Visibility
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                      {tempTable.getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <li key={column.id} className="px-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">{column.columnDef.header || column.id}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn flex items-center gap-1 border px-3 py-1 text-sm bg-white border-blue-500 rounded-md"> {result} <span><IoMdArrowDropdown /></span></div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li onClick={()=> {setPageSize(10) ; setResult("Show 10 Result");}}><a>Show 10 Result</a></li>
                    <li onClick={()=> {setPageSize(20) ; setResult("Show 20 Result");}}><a>Show 20 Result</a></li>
                    <li onClick={()=> {setPageSize(50) ; setResult("Show 50 Result");}}><a>Show 50 Result</a></li>
                    <li onClick={()=> {setPageSize(data.length) ; setResult("Show All data");}}><a>Show All Result</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className=" border-2 rounded-md px-3 py-1" type="text" placeholder="Search..." name="" id="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Accounts;
