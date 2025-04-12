import { useEffect, useMemo, useState, useRef, useContext } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoNewspaperSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

function Table({ data, setData, columns, pageSize, globalFilter, setGlobalFilter, filterType, columnVisibility, setColumnVisibility }) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const modalsRef = useRef({});
  const [editData, setEditData] = useState(null);
  const editModalRef = useRef(null);
  const [success, setSuccess] = useState("");
  const [errors , setErrors] = useState({errorCode: "" , errorName : "" , errorAddress : "" , errorCurrency : "" , errorMobile : ""});
  const token = localStorage.getItem("token") ;
  const {setUser} = useContext(AuthContext) ;
  const navigate = useNavigate() ;

  useEffect(() => {
    table.setPageSize(pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  useEffect(() => {
    const getAccounts = async () => {
      try {
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
  }, [setData]);

  const deleteAccount = async (account_id) => {
    try {
      const response = await fetch("http://localhost:8080/deleteAccount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}` },
        body: JSON.stringify({ account_id })
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(prevData => prevData.filter(account => account.id !== account_id));
      }else if(result.status == "error_token"){
        setUser(null) ;
        navigate("/") ;
        
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditClick = (row) => {
    setEditData(row);
    editModalRef.current?.showModal();
  };

  const saveEdit = async (updatedData) => {
    try {
      const updatedDataWithID = {
        ...updatedData,
        account_id: updatedData.id,  
      };
      // console.log(updatedData.id);

      const response = await fetch("http://localhost:8080/updateAccount", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedDataWithID)
      });
  
      const result = await response.json();
  
      if (result.status === "success") {
        setData(prev =>
          prev.map(acc =>
            acc.id === updatedData.id ? { ...acc, ...updatedData } : acc
          )
        );
        setSuccess("Account updated successfully");
  
        setTimeout(() => {
          setSuccess("");
          editModalRef.current.close();
        }, 1500);
  
        setErrors({
          errorCode: "",
          errorName: "",
          errorAddress: "",
          errorCurrency: "",
          errorMobile: ""
        });
      } else if(result.status === "error_token") {
        setUser(null);
        navigate("/");
      }else if(result.message === "No changes were made to the account. Please check the provided data."){
        setSuccess(result.message);

      }else if (result.status === "error" && result.message === "Code already exists for another account") {
        setErrors({
          errorCode: "Code already exists",
          errorMobile: "",
          errorName: "",
          errorAddress: "",
          errorCurrency: ""
        });
        setSuccess("");
      }
      else {
        setErrors({
          errorCode: result.errors.code || "",
          errorName: result.errors.name || "",
          errorAddress: result.errors.address || "",
          errorCurrency: result.errors.currency || "",
          errorMobile: result.errors.mobile || ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const codeString = row.code?.toString() || "";
      if (filterType === "supplier") return codeString.startsWith("401");
      if (filterType === "customer") return codeString.startsWith("411");
      return true;
    });
  }, [data, filterType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter, sorting, pagination, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const openDeleteModal = (id) => {
    const modal = modalsRef.current[id];
    if (modal) modal.showModal();
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="container mt-3 overflow-auto">
        <table className="table-auto w-full border">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="p-2 cursor-pointer text-center"
                  >
                    <div className="flex justify-between items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? <IoMdArrowDropup /> :
                        header.column.getIsSorted() === "desc" ? <IoMdArrowDropdown /> : null}
                    </div>
                  </th>
                ))}
                <th>Action</th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100 border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 text-center border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="p-2 text-center border">
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn border-none bg-white h-[27px] hover:bg-blue-900 hover:text-white">
                      <p className="mt-[-7px]">...</p>
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box w-36 z-1  p-2 shadow-sm">
                      <li><a className="flex gap-1 items-center"><FaEye /> View</a></li>
                      <li><a className="flex gap-1 items-center" onClick={() => handleEditClick(row.original)}><MdEdit /> Edit</a></li>
                      <li><a className="flex gap-1 items-center" onClick={() => openDeleteModal(row.original.id)}><MdDelete /> Delete</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-600 text-sm">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)} of {table.getPrePaginationRowModel().rows.length} entries
          </span>

          <div className="flex items-center space-x-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 bg-gray-200 text-sm text-gray-700 rounded disabled:opacity-50">Previous</button>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button key={i} onClick={() => table.setPageIndex(i)} className={`px-3 py-1 border rounded ${table.getState().pagination.pageIndex === i ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Delete Modals */}
      {filteredData.map((row) => (
        <dialog key={row.id} ref={(el) => { modalsRef.current[row.id] = el }} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Are you sure you want to delete?</h3>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">No</button>
                <button onClick={() => deleteAccount(row.id)} className="ml-3 btn btn-error">Yes</button>
              </form>
            </div>
          </div>
        </dialog>
      ))}

      {/* Edit Modal */}
      <dialog ref={editModalRef} className="modal">
        <div className="modal-box sm:max-w-[70%] max-w-[90%]">
          <div className="flex items-center gap-3 h-[50px] pl-5 border-b">
            <span className="rounded-full w-7 flex justify-center items-center h-7 bg-blue-200"><IoNewspaperSharp /></span>
            <p className="font-bold">Edit Account</p>
          </div>
          <form className="my-4 border-b">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-3">
                <label className="text-sm text-gray-500" htmlFor="code">Code:</label><span className="font-bold text-sm text-red-600">{errors.errorCode}</span>
              </div>
              <input
                value={editData?.code || ""}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                className="w-full border p-2 h-8"
                type="number"
                id="code"
              />
            </div>

            <div className="flex flex-col gap-2 w-full mt-3">
              <div className="flex gap-3">
                <label className="text-sm text-gray-500" htmlFor="name">Name:</label><span className="font-bold text-sm text-red-600">{errors.errorName}</span>
              </div>
              <input
                value={editData?.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full border p-2 h-8"
                type="text"
                id="name"
              />
            </div>

            <div className="flex flex-col gap-2 w-full mt-3">
              <div className="flex gap-3">
                <label className="text-sm text-gray-500" htmlFor="currency">Main Currency:</label><span className="font-bold text-sm text-red-600">{errors.errorCurrency}</span>
              </div>
              <select
                className="w-full h-fit border p-2"
                id="currency"
                value={editData?.main_currency || ""}
                onChange={(e) => setEditData({ ...editData, main_currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="LBP">LBP</option>
              </select>

            </div>

            <div className="flex flex-col gap-2 w-full mt-3">
              <div className="flex gap-3">
                <label className="text-sm text-gray-500" htmlFor="address">Address:</label><span className="font-bold text-sm text-red-600">{errors.errorAddress}</span>
              </div>
              <input
                value={editData?.address || ""}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full border p-2 h-8"
                type="text"
                id="address"
              />
            </div>

            <div className="flex flex-col gap-2 w-full mt-3">
              <div className="flex gap-3">
                <label className="text-sm text-gray-500" htmlFor="mobile">Mobile:</label><span className="font-bold text-sm text-red-600">{errors.errorMobile}</span>
              </div>
              <input
                value={editData?.mobile || ""}
                onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                className="w-full border p-2 h-8"
                type="tel"
                id="mobile"
              />
            </div>
          </form>

          <div className="flex justify-between items-center">
            <p className="text-sm text-green-500 font-bold">{success}</p>
            <div className="flex justify-end gap-2 mt-3 mb-4">
              <form method="dialog">
                <button className="btn rounded-md h-8 bg-white hover:bg-blue-900 text-blue-900 hover:text-white">Close</button>
              </form>
              <button onClick={() => saveEdit(editData)} className="btn rounded-md h-8 bg-blue-900 hover:bg-white text-white hover:text-blue-900">Save</button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Table;
