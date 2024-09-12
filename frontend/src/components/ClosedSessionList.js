"use client";

import { Button, Card, Flex, List, Typography } from "antd";
import { DotsTreeVerticalIcon } from "./Icons";

const { Title, Text } = Typography;

const ClosedSessionList = ({ data = [] }) => {
  return (
    <List
      pagination={{
        pageSize: 5,
      }}
      dataSource={data}
      renderItem={(item) => (
        <div className="mb-3">
          <Card hoverable>
            <Flex align="center" justify="space-between">
              <div>
                <Title level={4}>{item?.session_name}</Title>
                <Text>{item?.context}</Text>
              </div>
              <div>
                <Button type="link">
                  <DotsTreeVerticalIcon />
                </Button>
              </div>
            </Flex>
          </Card>
        </div>
      )}
    />
  );
};

export default ClosedSessionList;
