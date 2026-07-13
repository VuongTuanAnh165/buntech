export enum InventoryType {
  IN = 'in', // Phiếu nhập kho (tăng số lượng tồn)
  OUT = 'out', // Phiếu xuất kho (giảm số lượng tồn)
  ADJUSTMENT = 'adjustment', // Phiếu điều chỉnh kiểm kê (cân bằng kho thực tế)
}
