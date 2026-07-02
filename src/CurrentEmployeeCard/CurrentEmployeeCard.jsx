import React from "react";
import { useState, useEffect } from "react";
import { Avatar, List, Row, Input, Space, Radio, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./CurrentEmployeeCard.css";
import axios from "axios";
import { Link } from "react-router-dom";
import API_ENDPOINTS from "../config";
const { Search } = Input;

const CurrentEmployeeCard = () => {
  const [respdata, setRespdata] = useState([]);
  const [empStatus, setEmpStatus] = useState("onBoarding");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalItems = respdata.length;

  const onChange = (e) => {
    console.log(`radio checked:${e.target.value}`);
    setEmpStatus(e.target.value);
  };

  useEffect(() => {
    fetchData();
  }, [empStatus]);

  const fetchData = () => {
    //default status =onBoarding
    axios.get(API_ENDPOINTS.employeesListByStatus, {
      params: {
        status: empStatus
      }
    })
      .then(response => {
        console.log(response.data);
        setRespdata(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Row>
        <Space>
          <Space.Compact size="large">
            <Input addonBefore={<SearchOutlined />} placeholder="Search" />
          </Space.Compact>
        </Space>
      </Row>
      <Row className="mrgTop15">
        <Radio.Group onChange={onChange} defaultValue="onboard" size="large">
          <Radio.Button value="onBoarding">On Boarding</Radio.Button>
          <Radio.Button value="Bench">Bench</Radio.Button>
          <Radio.Button value="Active">Active</Radio.Button>
          <Radio.Button value="detailedView">
            <Link to="/workforce">Detailed View</Link>
          </Radio.Button>
        </Radio.Group>
      </Row>
      <List
        className="currentEmpList"
        itemLayout="horizontal"
        dataSource={respdata.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
        renderItem={(item, index) => {
          //console.log('Gender:', item.gender); // Check the gender value
          const seed = `${item.gender}-${index}`;
          const avatarUrl = `https://api.dicebear.com/7.x/${item.gender}/${seed}`;

          //console.log('Avatar URL:', avatarUrl);

          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                  />
                }
                // avatar={<Avatar src={avatarUrl} />}
                title={item.firstName + " " + item.lastName}
                description={item.designation + " / " + item.primarySkills}
              />
            </List.Item>
          );
        }}
      />
      <Pagination
        style={{ marginTop: "16px", textAlign: "center" }}
        current={currentPage}
        pageSize={pageSize}
        total={totalItems}
        onChange={handlePageChange}
      />
    </>
  );
};

export default CurrentEmployeeCard;
