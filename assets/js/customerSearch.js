{
    let a = document.querySelector('#customerinput');
    if (a) {
        a.addEventListener('keyup', function () {
            $('#customeroptions')[0].innerHTML = "";
            if (!a.value.length) {
                $('#customeroptions').append(`<option value="">Select Customer ....</option>`);
                return;
            }
            let temp = customerTable.filter(obj => obj.searchStr.toLowerCase().includes(a.value.toLowerCase()));
            if (temp.length)
                for (let i of temp)
                    $('#customeroptions').append(`<option value="${i._id}">${i.searchStr}</option>`);
            else
                $('#customeroptions').append(`<option value="">No Customer Found</option>`);
        });
    }
}