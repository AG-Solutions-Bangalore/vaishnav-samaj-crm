import { Card, Spin, Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { PENDING_OLD_USERS } from "../../api";
import SGSTable from "../../components/STTable/STTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { exportPendingUsersToExcel } from "../../components/exportExcel/exportPendingUsersToExcel";

// const { Search } = Input;

const PendingUsers = () => {
  // const [searchTerm, setSearchTerm] = useState("");
  const { trigger: GetPendingUser, loading: isMutating } = useApiMutation();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
  });

  const fetchUser = async () => {
    const res = await GetPendingUser({ url: PENDING_OLD_USERS });
    if (Array.isArray(res.data)) {
      setUsers(res.data);
    } else if (Array.isArray(res)) {
      setUsers(res);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "full_name",
      key: "full_name",
      render: (_, user) => user.full_name || "-",
    },
    {
      title: "Address",
      key: "address",
      render: (_, user) => (
        <div
          style={{
            maxWidth: 350,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {user.address || user.related_address || "-"}
        </div>
      ),
    },
    {
      title: "Mobile",
      key: "mobile",
      render: (_, user) => user.mobile || user.related_mobile || "-",
    },
    {
      title: "Email",
      key: "email",
      render: (_, user) => user.email || user.related_email || "-",
    },
  ];

  /*
  const filteredUsers = users
    .map((user) => {
      const flatString = Object.values(user)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(" ")
        .toLowerCase();
      const matched = flatString.includes(searchTerm.toLowerCase());
      return matched ? { ...user, _match: searchTerm } : null;
    })
    .filter(Boolean);
  */

  const handleExportExcel = () => {
    exportPendingUsersToExcel(users, "Pending Old Users List");
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Pending Users List</h2>
        <div className="flex-1 flex gap-4 sm:justify-end">
          {/*
          <Search
            placeholder="Search Users"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="max-w-sm"
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white-100 border border-white-100 shadow-2xl" />
              <span className="text-sm text-gray-700">Single</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
              <span className="text-sm text-gray-700">Relation</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span className="text-sm text-gray-700">Duplicate</span>
            </div>
          </div>
          */}

          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700"
          >
            Download Excel
          </Button>
        </div>
      </div>

      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : users.length > 0 ? (
          <SGSTable
            data={users}
            columns={columns}
            pagination={pagination}
            onChange={(pag) => setPagination(pag)}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">No data found.</div>
        )}
      </div>
    </Card>
  );
};

export default PendingUsers;
