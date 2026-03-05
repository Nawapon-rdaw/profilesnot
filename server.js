<script>
async function verifyOTP(){

const res = await fetch("/verify-otp",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
email: document.getElementById("email").value,
otp: document.getElementById("otp").value
})
})

const data = await res.json()

if(data.success){
window.location.href = data.redirect
}else{
alert(data.message)
}

}
</script>
