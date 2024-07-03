// Simulasikan pengambilan saldo dari database atau sesi
///const saldo = 500000; // Gantilah ini dengan logika pengambilan saldo yang sesungguhnya

// Tampilkan saldo dalam kartu di halaman view_balance.html
///const balanceCard = document.getElementById('balance-card');
////balanceCard.innerHTML = `
///  <p>Your current balance is:</p>
///  <h3>${saldo} IDR</h3>
////`;
document.oncontextmenu = () => {
  alert("Mau Ngapain Om?")
  return false
}
document.onkeydown = e => {
  if(e.key == "F12"){
    alert("Mau Ngapain Lagi Om?")
    return false
  }
  if(e.ctrlkey && e.key == "u") {
    alert("Mau Ngapain Lagi Om?")
    return false
  }
}