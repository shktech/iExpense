import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { IExpense, IReport } from "@/constants/types";
import { reportService } from "@/services/reportService";
import Stepper from "@/components/Stepper";
import DeleteReportDrawer from "@/components/report/details/DeleteDrawer";
import CreateNewExpenseDrawer from "@/components/report/details/CreateNewExpenseDrawer";
import EditExpenseDrawer from "@/components/report/details/EditExpenseDrawer";
import { formatDate } from "@/utils/UtilFunctions";
import { ReportStatusTextColor } from "@/utils/UtilData";
import { ReportStatusBgColor } from "@/utils/UtilData";

export default function ExpenseDetails() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<IReport | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isUploadFileModalVisible, setUploadFileModalVisible] = useState(false);
  const [isReportDeleteModalVisible, setIsReportDeleteModalVisible] =
    useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [reportItems, setReportItems] = useState<any[]>([]);
  useEffect(() => {
    const fetchReportItems = async () => {
      const data = await reportService.getReportItems(id as string);
      console.log(data);
      setReportItems(data);
    };
    fetchReportItems();
  }, [id]);

  useEffect(() => {
    const fetchReport = async () => {
      const data = await reportService.getReportById(id as string);
      setReport(data);
    };
    fetchReport();
  }, [id]);

  const handleExpensePress = (expense: IExpense) => {
    setSelectedExpense(expense);
  };

  const handleReportDelete = async () => {
    setIsReportDeleteModalVisible(false);
    await reportService.deleteReport(id as string);
    router.replace("/reports");
  };

  const handleSubmit = () => {
    setIsSubmitModalVisible(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setReportItems(reportItems.filter((item) => item.id !== expenseId));
  };

  const handleEditExpense = (expense: any) => {
    setReportItems(
      reportItems.map((item) => (item.id === expense.id ? expense : item))
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={36} color="#000" />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Ionicons name="add" size={36} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsReportDeleteModalVisible(true)}
              >
                <Ionicons name="trash-outline" size={36} color="#000" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.header} className="bg-black">
        <View style={styles.titleContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{report?.purpose}</Text>
            <Text style={styles.id}>#{report?.report_number}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: ReportStatusBgColor(report?.report_status as string) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: ReportStatusTextColor(report?.report_status as string) },
              ]}
            >
              {report?.report_status}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>${report?.report_amount}</Text>
        <Text style={styles.dateLabel} className="bg-black">
          Submission: {report?.report_submit_date}
        </Text>
        <Text style={styles.dateLabel}>
          Approval: {report?.integration_date}
        </Text>
        <Stepper
          // currentState={report?.report_status}
          currentState={"submitted"}
          date={report?.report_submit_date as string}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => setIsSubmitModalVisible(true)}
      >
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>

      <View style={styles.expenseSection}>
        <Text style={styles.sectionTitle}>Expense Items</Text>
        <ScrollView>
          {reportItems?.map((reportItem) => (
            <TouchableOpacity
              key={reportItem.id}
              style={styles.expenseItem}
              onPress={() => handleExpensePress(reportItem)}
            >
              <View>
                <Text style={styles.expenseItemTitle}>
                  {reportItem.expense_type}
                </Text>
                <Text style={styles.expenseItemAmount}>
                  ${reportItem.receipt_amount}
                </Text>
                <Text style={styles.expenseItemDate}>
                  {formatDate(reportItem.expense_date) || ""}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
          {reportItems?.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No expenses</Text>
              <Text style={styles.emptySubtext}>
                Tap the "+" button and start adding expenses
              </Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>Add expense</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.tabBar}>
        <View style={[styles.tabItem]}>
          <Ionicons name="document-text" size={24} color="#1E3A8A" />
          <Text style={styles.tabText}>Reports</Text>
        </View>
        <View style={styles.tabItem}>
          <Pressable
            style={styles.tabAddButton}
            // onPress={() => setIsNewReportDrawerVisible(true)}
            onPress={() => console.log(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>My Profile</Text>
        </View>
      </View>

      <CreateNewExpenseDrawer
        isVisible={isModalVisible}
        reportId={id as string}
        onClose={() => setIsModalVisible(false)}
        onAddExpense={(reportItem) =>
          setReportItems([...reportItems, reportItem])
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUploadFileModalVisible}
        onRequestClose={() =>
          setUploadFileModalVisible(!isUploadFileModalVisible)
        }
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalUploadTitle}>Uploaded receipt</Text>
            <View style={styles.uploadContent}></View>
            <View style={styles.btnsContainer}>
              <Pressable
                style={[styles.button, styles.buttonUpload]}
                // onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={[styles.textStyle, styles.uploadBtnText]}>
                  Upload receipt
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setUploadFileModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <EditExpenseDrawer
        selectedExpense={selectedExpense}
        reportId={id as string}
        setSelectedExpense={setSelectedExpense}
        onDeleteExpense={handleDeleteExpense}
        onEditExpense={handleEditExpense}
      />

      <DeleteReportDrawer
        isVisible={isReportDeleteModalVisible}
        onClose={() => setIsReportDeleteModalVisible(false)}
        onDelete={handleReportDelete}
        report={report as IReport}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSubmitModalVisible}
        onRequestClose={() => setIsSubmitModalVisible(false)}
      >
        <Pressable
          style={styles.deleteModalOverlay}
          onPress={() => setIsSubmitModalVisible(false)}
        >
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>
              Are you sure you want to submit this report?
            </Text>

            <View style={styles.deleteModalDetails}>
              <View style={styles.submitDetailsTitleContainer}>
                <Text style={styles.submitDetailsPurposeLabel}>
                  {report?.purpose}
                </Text>
                <Text style={styles.submitDetailsNumberLabel}>
                  #{report?.report_number}
                </Text>
              </View>
              <Text style={styles.submitDetailsAmountLabel}>
                ${report?.report_amount}
              </Text>
              <View>
                <Text style={styles.submitDetailsDateLabel}>
                  Submission: {formatDate(report?.updated_at as string) || ""}
                </Text>
                <Text style={styles.submitDetailsDateLabel}>
                  Approval: {formatDate(report?.updated_at as string) || ""}
                </Text>
              </View>
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setIsSubmitModalVisible(false)}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalConfirmButton,
                  { backgroundColor: "#1E3A8A" },
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.deleteModalConfirmText}>Yes, submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000080",
    zIndex: 99,
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    alignItems: "flex-start",
    shadowColor: "#000",
    width: "95%",
    zIndex: 99,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalUploadTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1e1e1e",
    lineHeight: 26,
    width: "100%",
  },
  uploadContent: {
    height: 262,
    width: "100%",
    backgroundColor: "#DDDDDD",
    borderRadius: 8,
    marginBlock: 10,
  },
  btnsContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    height: 88,
    alignItems: "center",
  },

  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "49%",
    height: 56,
  },

  buttonUpload: {
    backgroundColor: "#F5F5F5",
    color: "#000",
  },

  uploadBtnText: {
    color: "#000",
  },
  buttonClose: {
    backgroundColor: "#17317F",
    color: "white",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    display: "flex",
    backgroundColor: "#fff",
    height: "100%",
  },
  headerRight: {
    flexDirection: "row",
    gap: 15,
    marginRight: 8,
  },
  headerLeft: {
    flexDirection: "row",
    marginLeft: 8,
  },
  header: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  id: {
    color: "#666",
  },
  amount: {
    fontSize: 17,
    fontWeight: "400",
    marginVertical: 8,
  },
  dateLabel: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#1a237e",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // expenseSection: {
  //   padding: 16,
  //   backgroundColor: "#f5f5f5",
  // },
  // sectionTitle: {
  //   fontSize: 18,
  //   fontWeight: "600",
  //   marginBottom: 16,
  // },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#000",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 8,
    backgroundColor: "white",
  },
  tabItem: {
    alignItems: "center",
  },
  tabAddButton: {
    backgroundColor: "#1E3A8A",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  tabText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  activeTab: {
    color: "#1E3A8A",
  },
  modalContainer: {
    // flex: 1,
    // marginTop: 100,
    backgroundColor: "white",
  },
  modalContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  expenseTypeList: {
    // flex: 1,
    height: 300,
  },
  expenseTypeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedExpenseType: {
    backgroundColor: "#EEF2FF",
  },
  expenseTypeText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 16,
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  nextButton: {
    padding: 16,
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1E3A8A",
  },
  disabledButton: {
    backgroundColor: "#A0AEC0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "600",
  },
  selectedTypeContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  currencyPrefix: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 8,
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 8,
  },
  currencyText: {
    color: "#666",
  },
  currencyInput: {
    flex: 1,
    padding: 16,
  },
  justificationInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
  },
  uploadContainer: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadText: {
    color: "#666",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  expenseSection: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  expenseItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  expenseItemAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseItemDate: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "red",
    width: 56,
    height: 56,
  },
  saveButton: {
    flex: 1,
    marginLeft: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1E3A8A",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  editModalContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  deleteModalContent: {
    backgroundColor: "white",
    padding: 20,
    width: "100%",
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  deleteModalDetails: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 4,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  deleteModalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  deleteModalCancelText: {
    color: "#666",
    fontWeight: "600",
  },
  deleteModalConfirmText: {
    color: "white",
    fontWeight: "600",
  },
  openButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  openButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 24,
    paddingHorizontal: 0,
  },
  stepperItem: {
    alignItems: "center",
    width: 80,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: "#1E40AF",
  },
  stepNumberText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  activeStepText: {
    color: "white",
  },
  stepLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
  },
  stepDate: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  stepperLine: {
    width: "20%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
  },
  submitDetailsTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
  submitDetailsPurposeLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  submitDetailsNumberLabel: {
    color: "#5B5B5B",
    fontSize: 13,
    marginLeft: 4,
  },
  submitDetailsAmountLabel: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 8,
  },
  submitDetailsDateLabel: {
    fontSize: 13,
    color: "#5B5B5B",
  },
});
