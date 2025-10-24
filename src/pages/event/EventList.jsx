import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  QrcodeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { EVENT } from "../../api";
import AvatarCell from "../../components/common/AvatarCell";
import SGSTable from "../../components/STTable/STTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import EventMidScanner from "../eventtrack/EventTrackerQR";
import EventTrackForm from "../eventtrack/EventTrackForm";
import EventForm from "./EventForm";
import { useNavigate } from "react-router-dom";
import HighlightText from "../../components/common/HighlightText";
const { Search } = Input;
const EventList = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [multiMemberModal, setMultiMemberModal] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [NoofMember, setNoofMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { trigger, loading: isMutating } = useApiMutation();
  const [users, setUsers] = useState([]);
  const [imageUrls, setImageUrls] = useState({
    userImageBase: "",
    noImage: "",
  });
  const fetchUser = async () => {
    const res = await trigger({
      url: EVENT,
    });

    if (Array.isArray(res.data)) {
      setUsers(res.data);

      const userImageObj = res.image_url?.find(
        (img) => img.image_for == "Event"
      );
      const noImageObj = res.image_url?.find(
        (img) => img.image_for == "No Image"
      );

      setImageUrls({
        userImageBase: userImageObj?.image_url || "",
        noImage: noImageObj?.image_url || "",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleScannerClose = () => {
    // setEventId(null);
    setOpenQrDialog(false);
    setScanning(false);
    setMultiMemberModal(false);
  };
  const handleScanner = (user) => {
    setEventId(user.id);
    setNoofMember(user.event_no_member_allowed);
    setOpenQrDialog(true);
    setScanning(true);
  };
  const handleEdit = (user) => {
    setEventId(user.id);
    setOpenDialog(true);
  };

  const handleAddUser = () => {
    setEventId(null);
    setOpenDialog(true);
  };
  const handleToggleStatus = async (user) => {
    try {
      const newStatus =
        user.event_status == "Active" || user.event_status == true
          ? "Inactive"
          : "Active";
      const res = await trigger({
        url: `${EVENT}s/${user.id}/status`,
        method: "patch",
        data: { event_status: newStatus },
      });

      if (res?.code === 201) {
        message.success(
          res.message ||
            `User marked as ${newStatus == "active" ? "Active" : "Inactive"}`
        );
        fetchUser();
      } else {
        message.error(res.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating user status.");
    }
  };

  const columns = [
    {
      title: "",
      key: "member_images",
      render: (_, user) => {
        const eventImageSrc = user.event_image
          ? `${imageUrls.userImageBase}${user.event_image}`
          : imageUrls.noImage;

        return (
          <div className="flex justify-center">
            <AvatarCell imageSrc={eventImageSrc} />
          </div>
        );
      },
      width: 70,
    },
    {
      title: "Name",
      dataIndex: "event_name",
      key: "event_name",
      render: (_, user) => (
        <HighlightText text={user.event_name} match={user._match} />
      ),
    },
    {
      title: "From Date",
      dataIndex: "event_from_date",
      key: "event_from_date",
      render: (_, user) => (
        <HighlightText
          text={dayjs(user.event_from_date).format("DD-MM-YYYY")}
          match={user._match}
        />
      ),
    },
    {
      title: "To Date",
      dataIndex: "event_to_date",
      key: "event_to_date",
      render: (_, user) => (
        <HighlightText
          text={dayjs(user.event_to_date).format("DD-MM-YYYY")}
          match={user._match}
        />
      ),
    },
    {
      title: "Payment",
      dataIndex: "event_payment",
      key: "event_payment",
      render: (_, user) => (
        <HighlightText text={user.event_payment} match={user._match} />
      ),
    },
    {
      title: "Amount",
      dataIndex: "event_amount",
      key: "event_amount",
      render: (_, user) => (
        <HighlightText text={user.event_amount} match={user._match} />
      ),
    },
    {
      title: "Allowed Member",
      dataIndex: "event_member_allowed",
      key: "event_member_allowed",
      render: (_, user) => (
        <HighlightText text={user.event_member_allowed} match={user._match} />
      ),
    },
    {
      title: "No of Allowed",
      dataIndex: "event_no_member_allowed",
      key: "event_no_member_allowed",
      render: (_, user) => (
        <HighlightText
          text={user.event_no_member_allowed}
          match={user._match}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "event_status",
      key: "event_status",
      render: (_, user) => {
        const isActive = user.event_status === "Active";
        return (
          <div className="flex justify-center">
            <Popconfirm
              title={`Mark Event as ${isActive ? "Inactive" : "Active"}?`}
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleToggleStatus(user)}
            >
              <Tag
                color={isActive ? "green" : "red"}
                icon={isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                className="cursor-pointer"
              >
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </Popconfirm>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, user) => {
        const today = dayjs();
        const startDate = dayjs(user.event_from_date);
        const endDate = dayjs(user.event_to_date);

        const isActivePeriod =
          today.isSame(startDate, "day") ||
          today.isSame(endDate, "day") ||
          (today.isAfter(startDate) && today.isBefore(endDate));

        return (
          <Space>
            <Tooltip title="Edit Event">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(user)}
              />
            </Tooltip>

            <Tooltip title="Add Tracker">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setOpenEventDialog(true)}
                disabled={!isActivePeriod}
              />
            </Tooltip>

            <Tooltip title="Generate QR">
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={() => handleScanner(user)}
                disabled={!isActivePeriod}
              />
            </Tooltip>

            <Tooltip title="View Attended Members">
              <Button
                type="primary"
                icon={<UserOutlined />}
                size="small"
                onClick={() => navigate(`/event-attend-member/${user.id}`)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
  const filteredUsers = users
    .map((user) => {
      const newUser = { ...user, _matchFields: {} };
      Object.keys(user).forEach((key) => {
        const value = user[key];
        if (typeof value === "string" || typeof value === "number") {
          if (String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
            newUser._matchFields[key] = searchTerm;
          }
        }
      });
      return Object.keys(newUser._matchFields).length > 0 ? newUser : null;
    })
    .filter(Boolean);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Event List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search event"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="max-w-sm"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Add Event
          </Button>
        </div>
      </div>
      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <SGSTable data={users} columns={columns} />
        ) : (
          <div className="text-center text-gray-500 py-20">No data found.</div>
        )}
      </div>
      {openDialog && (
        <EventForm
          open={openDialog}
          setOpenDialog={setOpenDialog}
          eventId={eventId}
          fetchEvents={fetchUser}
        />
      )}
      {openQrDialog && (
        <Modal
          title="Scan"
          open={openQrDialog}
          footer={null}
          onCancel={handleScannerClose}
          centered
          width={420}
        >
          <EventMidScanner
            eventId={eventId}
            setOpenQrDialog={setOpenQrDialog}
            open={open}
            setScanning={setScanning}
            scanning={scanning}
            NoofMember={NoofMember}
            setMultiMemberModal={setMultiMemberModal}
            multiMemberModal={multiMemberModal}
          />
        </Modal>
      )}
      {openEventDialog && (
        <EventTrackForm
          open={openEventDialog}
          setOpenDialog={setOpenEventDialog}
        />
      )}
    </Card>
  );
};

export default EventList;
