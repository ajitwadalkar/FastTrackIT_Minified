
$(document).ready(()=>{
    $('#input').on("change",(evt) =>{
        let text = $('#input').val();
        $.get('/searchData',{text:text}).done((data)=>{
                let res = data['result'];
                if(res == "NoData")
                {
                    $('#errmsg').text('No data found.');
                }
                else
                {
                    $('#input').val('');
                    let dataToAdd = "<tr><td>"+ data['upa']+"</td><td>"+ data['rtnqty']+"</td><td>"+ data['seller']+"</td><td>"+ data['brand']+"</td><td>"+ data['todo']+"</td><td>"+ data['curDate']+"</td></tr>";
                    $('#tableData').append(dataToAdd)
                }
            }).fail((xhr)=>{
            alert('Prob contacting server');
            console.log(xhr);
        });
    });

    $('#tab2csv').on("click",(evt) =>{
        var $table = $('#tableData');
        var csv = $table.table2CSV({delivery:'value'});
        $.get('/postData',{text:csv});
        downloadFile('todaySearchData.csv', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csv));
    });


});

function downloadFile(fileName, urlData) {
    console.log(urlData);
    var aLink = document.createElement('a');
    aLink.download = fileName;
    aLink.href = urlData;
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
    delete aLink;
}

var regex = new RegExp("(.*?)\.(csv)$");

function triggerValidation(el) {
    if (!(regex.test(el.value.toLowerCase()))) {
        el.value = '';
        alert('Please select correct file format');
    }
}

function SubmitForm()
{
    document.getElementById("form1").submit();
}