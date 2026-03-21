import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 60,
    fontFamily: "Roboto",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: "3px solid #6E8AFA",
    borderRadius: 8,
  },
  innerBorder: {
    position: "absolute",
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    border: "1px solid #D4DDFF",
    borderRadius: 6,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6E8AFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },
  orgName: {
    fontSize: 11,
    color: "#6E8AFA",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 36,
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: "#6E8AFA",
    marginBottom: 36,
    borderRadius: 2,
  },
  presentedTo: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
    letterSpacing: 1,
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
    textAlign: "center",
  },
  completedText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6E8AFA",
    marginBottom: 40,
    textAlign: "center",
    maxWidth: 400,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 24,
    borderTop: "1px solid #e5e7eb",
    marginTop: 8,
  },
  footerBlock: {
    alignItems: "center",
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    color: "#aaa",
    marginBottom: 4,
    letterSpacing: 1,
  },
  footerValue: {
    fontSize: 11,
    color: "#444",
    fontWeight: "bold",
  },
});

interface CertificateProps {
  studentName: string;
  courseName: string;
  issuedAt: Date;
  certificateNumber: string;
}

export function CertificateDocument({
  studentName,
  courseName,
  issuedAt,
  certificateNumber,
}: CertificateProps) {
  const dateStr = issuedAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>А</Text>
          </View>

          <Text style={styles.orgName}>Академия Риэлторов</Text>
          <Text style={styles.title}>СЕРТИФИКАТ</Text>
          <Text style={styles.subtitle}>об успешном прохождении курса</Text>

          <View style={styles.divider} />

          <Text style={styles.presentedTo}>НАСТОЯЩИМ УДОСТОВЕРЯЕТСЯ, ЧТО</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.completedText}>успешно прошёл(а) курс</Text>
          <Text style={styles.courseName}>{courseName}</Text>

          <View style={styles.footer}>
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>ДАТА ВЫДАЧИ</Text>
              <Text style={styles.footerValue}>{dateStr}</Text>
            </View>
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>НОМЕР СЕРТИФИКАТА</Text>
              <Text style={styles.footerValue}>{certificateNumber}</Text>
            </View>
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>ВЫДАН</Text>
              <Text style={styles.footerValue}>Союз Риэлторов</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
