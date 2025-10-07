// import React from "react";
// import { Typography } from "antd";

// const { Title, Paragraph, Text } = Typography;

// export default function ContactPage() {
//     return (
//         <div
//             style={{
//                 padding: "40px",
//                 maxWidth: 800,
//                 margin: "0 auto",
//                 backgroundColor: "#fff",
//                 border: "1px solid #ddd",
//                 borderRadius: 8,
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//             }}
//         >
//             <Title level={2} style={{ marginBottom: 32, textAlign: "center" }}>
//                 Contact Us
//             </Title>

//             <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
//                 <Text strong>Customer Service Hours of Operation:</Text>
//                 <br />
//                 Monday – Sunday
//                 <br />
//                 9:00 AM to 5:00 PM
//             </Paragraph>

//             <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
//                 <Text strong>Phone:</Text> 01204468000
//                 <br />
//                 <Text strong>Email:</Text> columbiacare@chogoriindia.com
//             </Paragraph>

//             <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
//                 <Text strong>Address:</Text>
//                 <br />
//                 Windsor Grand, plot no. 1-C, 14A floor, expressway,
//                 <br />
//                 sector 126, Noida, Uttar Pradesh – 201313
//             </Paragraph>
//         </div>
//     );
// }



import React from "react";
import { Typography } from "antd";
 
const { Title, Paragraph, Text } = Typography;
 
export default function ContactPage() {
    return (
        <div
            style={{
                backgroundColor: "#d5d0d008",
                minHeight: "100vh",      
                paddingTop: "60px",      
                paddingBottom: "60px",  
            }}
        >
            <div
                style={{
                    padding: "40px",
                    maxWidth: 800,
                    margin: "0 auto",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >
                <Title level={2} style={{ marginBottom: 32, textAlign: "center" }}>
                    Contact Us
                </Title>
 
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                    <Text strong>Customer Service Hours of Operation:</Text>
                    <br />
                    Monday – Sunday
                    <br />
                    9:00 AM to 5:00 PM
                </Paragraph>
 
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                    <Text strong>Phone:</Text> 01204468000
                    <br />
                    <Text strong>Email:</Text> columbiacare@chogoriindia.com
                </Paragraph>
 
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                    <Text strong>Address:</Text>
                    <br />
                    Windsor Grand, plot no. 1-C, 14A floor, expressway,
                    <br />
                    sector 126, Noida, Uttar Pradesh – 201313
                </Paragraph>
            </div>
        </div>
    );
}
 
 