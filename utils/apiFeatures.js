class ApiFeatures{
    constructor(queryMethod,queryObj){
        this.queryMethod = queryMethod;
        this.queryObj = queryObj;
    }

    search(){
        const keyword = this.queryObj.keyword? 
            {
                name:{
                    $regex:this.queryObj.keyword,
                    $options:"i"
                }
            }:{} 
        //update filter object       
        this.queryMethod = this.queryMethod.find(keyword);
        return this;
    }

    filter(){
        //deep copy queryObj
        let queryObjCopy = {...this.queryObj};

        //leave only 'category', 'rating' and 'price' keys.Remove others
        const toRemove=['keyword','page','limit'];
        toRemove.forEach((ele)=>{
            delete queryObjCopy[ele];
        })
        
        //In 'price' and 'rating' adding dollar sign - i.e. replace 'gt' with '$gt'
        let queryStr = JSON.stringify(queryObjCopy);    //convert object into string
        queryStr = queryStr.replaceAll("gt","$gt").replaceAll("lt","$lt");  //replace
        queryObjCopy = JSON.parse(queryStr);    //convert back string into object

        //update filter object
        this.queryMethod = this.queryMethod.find(queryObjCopy);
        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryObj.page) || 1 ;
        const skip = resultPerPage * (currentPage-1);
        this.queryMethod = this.queryMethod.limit(resultPerPage).skip(skip);
        return this;
    }
}

export default ApiFeatures;